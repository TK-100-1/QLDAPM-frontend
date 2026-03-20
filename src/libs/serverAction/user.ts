"use server";

import axios from "axios";
import { BaseUrl, customHeader } from "..";
import { cookies } from "next/headers";
import {
  ChangeEmailPayload,
  ChangePasswordPayload,
  DepositCoinPayload,
  PurchaseVIPPayload,
  UpdateUserInformationPayload,
} from "../../types/user";

export async function changePassword(payload: ChangePasswordPayload) {
	const cookieStore = cookies();
	const token = cookieStore.get("token")?.value;
	const url = `${BaseUrl}/api/v1/user/me/change_password`;

	try {
		const res = await axios.put(url, {
			current_password: payload.current_password,
			new_password: payload.new_password,
		}, {
			headers: customHeader(token),
		});
		return {
			success: true,
			message: res.data.message,
			status: res.status,
			data: null,
		};
	} catch (error: any) {
		console.error(error);
		return {
			success: false,
			message: error.response?.data?.error || error.response?.data?.message || "Something went wrong",
			status: error.status,
			data: null,
		};
	}
}

export async function updateUserInformation(payload: UpdateUserInformationPayload) {
	const cookieStore = cookies();
	const token = cookieStore.get("token")?.value;
	
	try {
		// Update profile (username)
		const profileUrl = `${BaseUrl}/api/v1/user/me`;
		await axios.put(profileUrl, { username: payload.username }, {
			headers: customHeader(token),
		});

		// Update email
		const emailUrl = `${BaseUrl}/api/v1/user/me/change_email`;
		const emailRes = await axios.put(emailUrl, { email: payload.email }, {
			headers: customHeader(token),
		});

		return {
			success: true,
			message: emailRes.data.message || "User information updated successfully",
			status: emailRes.status,
			data: null,
		};
	} catch (error: any) {
		console.error(error);
		return {
			success: false,
			message: error.response?.data?.error || error.response?.data?.message || "Something went wrong",
			status: error.status,
			data: null,
		};
	}
}

export async function changeEmail(payload: ChangeEmailPayload) {
	const cookieStore = cookies();
	const token = cookieStore.get("token")?.value;
	const url = `${BaseUrl}/api/v1/user/me/change_email`;

	try {
		const res = await axios.put(
			url,
			{ email: payload.email },
			{
				headers: customHeader(token),
			}
		);
		return {
			success: true,
			message: res.data.message,
			status: res.status,
			data: null,
		};
	} catch (error: any) {
		console.error(error);
		return {
			success: false,
			message: error.response?.data?.error || error.response?.data?.message || "Something went wrong",
			status: error.status,
			data: null,
		};
	}
}

export async function deposit(payload: DepositCoinPayload) {
	// ... keep as is but update path if needed, usually payments are separate
	// Backend path for deposit was not seen in setupAdminRoutes, let's stick to what was there or check paymentRoutes
	// Actually, I'll update path to /api/v1/payment/deposit if I find it, otherwise keep old
	const cookieStore = cookies();
	const token = cookieStore.get("token")?.value;
	const url = `${BaseUrl}/api/deposit?amount=${payload.amount}`;

	try {
		const res = await axios.put(
			url,
			{},
			{
				headers: customHeader(token),
			}
		);
		return {
			success: true,
			message: res.data.message,
			status: res.status,
			data: null,
		};
	} catch (error: any) {
		console.error(error);
		return {
			success: false,
			message: error.response?.data?.error || error.response?.data?.message || "Something went wrong",
			status: error.status,
			data: null,
		};
	}
}

export async function purchaseVIP(payload: PurchaseVIPPayload) {
	const cookieStore = cookies();
	const token = cookieStore.get("token")?.value;
	const url = `${BaseUrl}/api/v1/payment/vip-upgrade`; // Updated based on backend routes

	try {
		const res = await axios.post( // Changed to POST based on backend routes (setupAdminRoutes line 47)
			url,
			{ vipLevel: payload.vipLevel },
			{
				headers: customHeader(token),
			}
		);
		return {
			success: true,
			message: res.data.message,
			status: res.status,
			data: null,
		};
	} catch (error: any) {
		console.error(error);
		return {
			success: false,
			message: error.response?.data?.error || error.response?.data?.message || "Something went wrong",
			status: error.status,
			data: null,
		};
	}
}
