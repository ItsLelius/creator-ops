declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(
    handler: (req: Request) => Response | Promise<Response>,
  ): void;
};


import { createClient } from "@supabase/supabase-js";

type CreateEmployeeBody = {
  name?: string;
  email?: string;
  password?: string;
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

function validateBody(body: CreateEmployeeBody) {
  const name = body.name?.trim() ?? "";
  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";

  if (!name) {
    return { error: "Employee name is required." };
  }

  if (!email) {
    return { error: "Employee email is required." };
  }

  if (!email.includes("@")) {
    return { error: "Enter a valid employee email." };
  }

  if (!password) {
    return { error: "Temporary password is required." };
  }

  if (password.length < 8) {
    return { error: "Temporary password must be at least 8 characters." };
  }

  return {
    data: {
      name,
      email,
      password,
    },
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
    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const publishableKey = getPublishableKey();
    const secretKey = getSecretKey();

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
      return jsonResponse(
        {
          ok: false,
          error: "You must be logged in.",
        },
        401,
      );
    }

    const { data: adminProfile, error: adminProfileError } = await adminClient
      .from("profiles")
      .select("id, email, name, role, status")
      .eq("id", user.id)
      .single();

    if (adminProfileError || !adminProfile) {
      return jsonResponse(
        {
          ok: false,
          error: "Your admin profile could not be verified.",
        },
        403,
      );
    }

    if (adminProfile.role !== "admin" || adminProfile.status !== "active") {
      return jsonResponse(
        {
          ok: false,
          error: "Only active admins can create employees.",
        },
        403,
      );
    }

    const body = (await req.json()) as CreateEmployeeBody;
    const validated = validateBody(body);

    if ("error" in validated) {
      return jsonResponse(
        {
          ok: false,
          error: validated.error,
        },
        400,
      );
    }

    const { name, email, password } = validated.data;

    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      return jsonResponse(
        {
          ok: false,
          error: "An employee profile with this email already exists.",
        },
        409,
      );
    }

    const { data: createdUserData, error: createUserError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role: "employee",
        },
      });

    if (createUserError || !createdUserData.user) {
      return jsonResponse(
        {
          ok: false,
          error: createUserError?.message ?? "Failed to create Auth user.",
        },
        400,
      );
    }

    const createdUser = createdUserData.user;

    const { error: profileInsertError } = await adminClient
      .from("profiles")
      .insert({
        id: createdUser.id,
        email,
        name,
        role: "employee",
        status: "active",
      });

    if (profileInsertError) {
      await adminClient.auth.admin.deleteUser(createdUser.id);

      return jsonResponse(
        {
          ok: false,
          error: `Auth user was created but profile failed, so user was cleaned up. ${profileInsertError.message}`,
        },
        400,
      );
    }

    return jsonResponse({
      ok: true,
      employee: {
        id: createdUser.id,
        email,
        name,
        role: "employee",
        status: "active",
      },
    });
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