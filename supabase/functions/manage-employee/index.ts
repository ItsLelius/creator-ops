declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(
    handler: (req: Request) => Response | Promise<Response>,
  ): void;
};

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type EmployeeAction = "update" | "set-status" | "delete";

type ProfileStatus = "active" | "disabled";

type ManageEmployeeBody = {
  action?: EmployeeAction;
  employeeId?: string;
  name?: string;
  email?: string;
  password?: string;
  status?: ProfileStatus;
};

type VerifyAdminResult =
  | {
      ok: true;
      adminClient: SupabaseClient;
      adminUserId: string;
    }
  | {
      ok: false;
      response: Response;
    };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function getPublishableKey() {
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (anonKey) {
    return anonKey;
  }

  const publishableKeys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");

  if (publishableKeys) {
    const parsed = JSON.parse(publishableKeys) as {
      default?: string;
    };

    if (parsed.default) {
      return parsed.default;
    }
  }

  throw new Error("Missing SUPABASE_ANON_KEY or SUPABASE_PUBLISHABLE_KEYS.");
}

function getSecretKey() {
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (serviceRoleKey) {
    return serviceRoleKey;
  }

  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");

  if (secretKeys) {
    const parsed = JSON.parse(secretKeys) as {
      default?: string;
    };

    if (parsed.default) {
      return parsed.default;
    }
  }

  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEYS.");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function verifyAdmin(
  supabaseUrl: string,
  publishableKey: string,
  secretKey: string,
  authHeader: string,
): Promise<VerifyAdminResult> {
  const userClient = createClient(supabaseUrl, publishableKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const adminClient = createClient(supabaseUrl, secretKey);

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      response: jsonResponse(
        {
          ok: false,
          error: "You must be logged in.",
        },
        401,
      ),
    };
  }

  const { data: adminProfile, error: adminProfileError } = await adminClient
    .from("profiles")
    .select("id, role, status")
    .eq("id", user.id)
    .single();

  if (adminProfileError || !adminProfile) {
    return {
      ok: false,
      response: jsonResponse(
        {
          ok: false,
          error: "Your admin profile could not be verified.",
        },
        403,
      ),
    };
  }

  if (adminProfile.role !== "admin" || adminProfile.status !== "active") {
    return {
      ok: false,
      response: jsonResponse(
        {
          ok: false,
          error: "Only active admins can manage employees.",
        },
        403,
      ),
    };
  }

  return {
    ok: true,
    adminClient,
    adminUserId: user.id,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return jsonResponse(
      {
        ok: false,
        error: "Method not allowed.",
      },
      405,
    );
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return jsonResponse(
        {
          ok: false,
          error: "Missing authorization header.",
        },
        401,
      );
    }

    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const publishableKey = getPublishableKey();
    const secretKey = getSecretKey();

    const verified = await verifyAdmin(
      supabaseUrl,
      publishableKey,
      secretKey,
      authHeader,
    );

    if (!verified.ok) {
      return verified.response;
    }

    const { adminClient, adminUserId } = verified;
    const body = (await req.json()) as ManageEmployeeBody;

    if (!body.action) {
      return jsonResponse(
        {
          ok: false,
          error: "Action is required.",
        },
        400,
      );
    }

    if (!body.employeeId) {
      return jsonResponse(
        {
          ok: false,
          error: "Employee ID is required.",
        },
        400,
      );
    }

    if (body.employeeId === adminUserId) {
      return jsonResponse(
        {
          ok: false,
          error: "You cannot modify your own admin account here.",
        },
        400,
      );
    }

    const { data: employeeProfile, error: employeeProfileError } =
      await adminClient
        .from("profiles")
        .select("id, email, name, role, status")
        .eq("id", body.employeeId)
        .single();

    if (employeeProfileError || !employeeProfile) {
      return jsonResponse(
        {
          ok: false,
          error: "Employee profile not found.",
        },
        404,
      );
    }

    if (employeeProfile.role !== "employee") {
      return jsonResponse(
        {
          ok: false,
          error: "Only employee accounts can be managed here.",
        },
        400,
      );
    }

    if (body.action === "set-status") {
      if (body.status !== "active" && body.status !== "disabled") {
        return jsonResponse(
          {
            ok: false,
            error: "Valid status is required.",
          },
          400,
        );
      }

      const { error } = await adminClient
        .from("profiles")
        .update({
          status: body.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", body.employeeId);

      if (error) {
        return jsonResponse(
          {
            ok: false,
            error: error.message,
          },
          400,
        );
      }

      return jsonResponse({
        ok: true,
        employee: {
          id: employeeProfile.id,
          email: employeeProfile.email,
          name: employeeProfile.name,
          role: "employee",
          status: body.status,
        },
      });
    }

    if (body.action === "update") {
      const name = body.name?.trim() ?? "";
      const email = normalizeEmail(body.email ?? "");
      const password = body.password ?? "";

      if (!name) {
        return jsonResponse(
          {
            ok: false,
            error: "Employee name is required.",
          },
          400,
        );
      }

      if (!email || !email.includes("@")) {
        return jsonResponse(
          {
            ok: false,
            error: "Valid employee email is required.",
          },
          400,
        );
      }

      if (password && password.length < 8) {
        return jsonResponse(
          {
            ok: false,
            error: "New password must be at least 8 characters.",
          },
          400,
        );
      }

      const { data: existingEmailOwner } = await adminClient
        .from("profiles")
        .select("id")
        .eq("email", email)
        .neq("id", body.employeeId)
        .maybeSingle();

      if (existingEmailOwner) {
        return jsonResponse(
          {
            ok: false,
            error: "Another account already uses this email.",
          },
          409,
        );
      }

      const authUpdate: {
        email: string;
        password?: string;
        user_metadata: {
          name: string;
          role: "employee";
        };
      } = {
        email,
        user_metadata: {
          name,
          role: "employee",
        },
      };

      if (password) {
        authUpdate.password = password;
      }

      const { error: authUpdateError } =
        await adminClient.auth.admin.updateUserById(
          body.employeeId,
          authUpdate,
        );

      if (authUpdateError) {
        return jsonResponse(
          {
            ok: false,
            error: authUpdateError.message,
          },
          400,
        );
      }

      const { error: profileUpdateError } = await adminClient
        .from("profiles")
        .update({
          name,
          email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", body.employeeId);

      if (profileUpdateError) {
        return jsonResponse(
          {
            ok: false,
            error: profileUpdateError.message,
          },
          400,
        );
      }

      return jsonResponse({
        ok: true,
        employee: {
          id: body.employeeId,
          email,
          name,
          role: "employee",
          status: employeeProfile.status,
        },
      });
    }

    if (body.action === "delete") {
      if (employeeProfile.status !== "disabled") {
        return jsonResponse(
          {
            ok: false,
            error: "Disable the employee before removing permanently.",
          },
          400,
        );
      }

      const { error: deleteAuthError } =
        await adminClient.auth.admin.deleteUser(body.employeeId);

      if (deleteAuthError) {
        return jsonResponse(
          {
            ok: false,
            error: deleteAuthError.message,
          },
          400,
        );
      }

      return jsonResponse({
        ok: true,
        removedEmployeeId: body.employeeId,
      });
    }

    return jsonResponse(
      {
        ok: false,
        error: "Unknown action.",
      },
      400,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    return jsonResponse(
      {
        ok: false,
        error: message,
      },
      500,
    );
  }
});