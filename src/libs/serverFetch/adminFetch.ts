import { cookies } from "next/headers";
import { BaseUrl } from "..";
import axios from "axios";

export interface AdminUser {
  user_id: string;
  username: string;
  email: string;
  vip_level: string;
  status: boolean;
  full_name: string;
  avatar_url: string;
  created_at: string;
}

export interface AdminPayment {
  order_id: string;
  user_id: string;
  orderInfo: string;
  transaction_status: string;
  amount: number;
}

export async function fetchAllUsers() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const url = `${BaseUrl}/admin/users`;

  try {
    const res = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
    return { data: res.data as AdminUser[], success: true };
  } catch (error) {
    console.error("fetchAllUsers error:", error);
    return { data: [], success: false };
  }
}

export async function fetchPaymentHistory() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const url = `${BaseUrl}/admin/payment-history`;

  try {
    const res = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
    return { data: res.data.payment_history as AdminPayment[], success: true };
  } catch (error) {
    console.error("fetchPaymentHistory error:", error);
    return { data: [], success: false };
  }
}

export interface AdminRole {
  _id: string;
  name: string;
  permissions: string[];
  price: number;
  description: string;
}

export async function fetchRoles() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const url = `${BaseUrl}/admin/roles`;

  try {
    const res = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
    return { data: res.data.data as AdminRole[], success: true };
  } catch (error) {
    console.error("fetchRoles error:", error);
    return { data: [], success: false };
  }
}
