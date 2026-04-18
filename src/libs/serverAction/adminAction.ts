"use server";

import { cookies } from "next/headers";
import { BaseUrl } from "..";
import axios from "axios";
import { revalidatePath } from "next/cache";

export async function manageUserAction(
  userId: string,
  action: "ban" | "active" | "delete",
) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  try {
    let res;
    if (action === "delete") {
      res = await axios.delete(`${BaseUrl}/admin/user/${userId}`, {
        headers: { Authorization: token },
      });
    } else {
      res = await axios.put(
        `${BaseUrl}/admin/user/${userId}/${action}`,
        {},
        {
          headers: { Authorization: token },
        },
      );
    }

    revalidatePath("/admin/users");
    return {
      success: true,
      message: res.data.message || `Action ${action} successful`,
    };
  } catch (error: any) {
    console.error(
      `[manageUserAction] error on ${action}:`,
      error.response?.data || error.message,
    );
    return {
      success: false,
      message: error.response?.data?.error || "Failed to perform action",
    };
  }
}

export async function createUserAction(payload: any) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  try {
    const res = await axios.post(`${BaseUrl}/admin/user`, payload, {
      headers: { Authorization: token },
    });
    revalidatePath("/admin/users");
    return { success: true, message: res.data.message };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || "Failed to create user",
    };
  }
}

export async function changeUserRoleAction(userId: string, role: string) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  try {
    const res = await axios.put(
      `${BaseUrl}/admin/user/${userId}/role`,
      { role },
      {
        headers: { Authorization: token },
      },
    );
    revalidatePath("/admin/users");
    return { success: true, message: res.data.message };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || "Failed to update role",
    };
  }
}
