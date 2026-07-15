import { supabase } from "../lib/supabase";

export type CreateEmployeeInput = {
  name: string;
  email: string;
  password: string;
};

export type UpdateEmployeeInput = {
  id: string;
  name: string;
  email: string;
  password?: string;
};

export type ManagedEmployee = {
  id: string;
  name: string;
  email: string;
  role: "employee";
  status: "active" | "disabled";
};

type CreateEmployeeResponse = {
  ok: boolean;
  employee?: ManagedEmployee;
  error?: string;
};

type ManageEmployeeResponse = {
  ok: boolean;
  employee?: ManagedEmployee;
  removedEmployeeId?: string;
  error?: string;
};

async function readFunctionError(error: unknown) {
  const maybeError = error as {
    message?: string;
    context?: Response;
  };

  if (maybeError.context) {
    try {
      const body = (await maybeError.context.json()) as {
        error?: string;
      };

      if (body.error) {
        return body.error;
      }
    } catch {
      return maybeError.message ?? "Request failed.";
    }
  }

  return maybeError.message ?? "Request failed.";
}

export async function createEmployee(input: CreateEmployeeInput) {
  const { data, error } =
    await supabase.functions.invoke<CreateEmployeeResponse>("create-employee", {
      body: {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        password: input.password,
      },
    });

  if (error) {
    throw new Error(await readFunctionError(error));
  }

  if (!data?.ok || !data.employee) {
    throw new Error(data?.error ?? "Failed to create employee.");
  }

  return data.employee;
}

export async function updateEmployee(input: UpdateEmployeeInput) {
  const { data, error } =
    await supabase.functions.invoke<ManageEmployeeResponse>("manage-employee", {
      body: {
        action: "update",
        employeeId: input.id,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        password: input.password?.trim() || undefined,
      },
    });

  if (error) {
    throw new Error(await readFunctionError(error));
  }

  if (!data?.ok || !data.employee) {
    throw new Error(data?.error ?? "Failed to update employee.");
  }

  return data.employee;
}

export async function setEmployeeAccess(
  employeeId: string,
  status: "active" | "disabled",
) {
  const { data, error } =
    await supabase.functions.invoke<ManageEmployeeResponse>("manage-employee", {
      body: {
        action: "set-status",
        employeeId,
        status,
      },
    });

  if (error) {
    throw new Error(await readFunctionError(error));
  }

  if (!data?.ok || !data.employee) {
    throw new Error(data?.error ?? "Failed to update employee access.");
  }

  return data.employee;
}

export async function removeEmployee(employeeId: string) {
  const { data, error } =
    await supabase.functions.invoke<ManageEmployeeResponse>("manage-employee", {
      body: {
        action: "delete",
        employeeId,
      },
    });

  if (error) {
    throw new Error(await readFunctionError(error));
  }

  if (!data?.ok || !data.removedEmployeeId) {
    throw new Error(data?.error ?? "Failed to remove employee.");
  }

  return data.removedEmployeeId;
}