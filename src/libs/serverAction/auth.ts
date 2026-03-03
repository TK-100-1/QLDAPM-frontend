"use server";

import axios from "axios";
import {
	ForgotPasswordPayload,
	ResetPasswordPayload,
	SignupPayload,
} from "@/src/types/user";
import { BaseUrl, customHeader } from "..";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signin(
	identifier: string,
	password: string,
) {
	let url = "";
	let payload = {};
	url = `${BaseUrl}/auth/login`;
	payload = {
		username: identifier,
		password: password,
	};
	try {
		const res = await axios.post(url, payload, {
			headers: customHeader(null),
		});
		console.log("[signin] response:", res.status, res.data);

		const token = res.data.token;
		if (!token) {
			return {
				success: false,
				message: "Something went wrong",
				status: 404,
				data: null,
			} as CustomResponse<null>;
		}

		const cookieStore = cookies();
		cookieStore.set("token", token, {
			path: "/",
			sameSite: "none",
			httpOnly: true,
			secure: true,
		});
		return {
			success: true,
			message: res.data.message,
			status: res.status,
			data: null,
		} as CustomResponse<null>;
	} catch (error: any) {
		console.error(error);
		return {
			success: false,
			message: error.response?.data?.message || error.response?.data?.error || "Something went wrong",
			status: error.status,
			data: null,
		} as CustomResponse<null>;
	}
}

export async function signout() {
	const cookieStore = cookies();
	cookieStore.delete("token");
	redirect("/signin");
}

export async function signup(payload: SignupPayload) {
	const url = `${BaseUrl}/auth/register`;

	try {
		const res = await axios.post(url, payload, {
			headers: customHeader(null),
		});

		return {
			success: true,
			message: res.data.message,
			status: res.status,
			data: null,
		} as CustomResponse<null>;
	} catch (error: any) {
		console.error(error);
		return {
			success: false,
			message: error.response?.data?.message || error.response?.data?.error || "Something went wrong",
			status: error.status,
			data: null,
		} as CustomResponse<null>;
	}
}

export async function refreshToken() {
	const cookieStore = cookies();
	const token = cookieStore.get("token")?.value;
	try {
		if (!token) {
			return {
				success: false,
				message: "No token found",
				status: 401,
				data: null,
			} as CustomResponse<null>;
		}
		const res = await axios.post(`${BaseUrl}/auth/refresh-token`, {}, {
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
		});
		const newToken = res.data.token;
		if (!newToken) {
			return {
				success: false,
				message: "Something went wrong",
				status: 404,
				data: null,
			} as CustomResponse<null>;
		}
		cookieStore.set("token", newToken, {
			path: "/",
			sameSite: "none",
			httpOnly: true,
			secure: true,
		});
		return {
			success: true,
			message: res.data.message,
			status: res.status,
			data: newToken,
		} as CustomResponse<string>;
	} catch (error: any) {
		console.error(error);
		return {
			success: false,
			message: error.response?.data?.message || error.response?.data?.error || "Something went wrong",
			status: error.status,
			data: null,
		} as CustomResponse<null>;
	}
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
	const url = `${BaseUrl}/auth/forgot-password`;
	try {
		const res = await axios.post(url, { email: payload.email }, {
			headers: customHeader(null),
		});
		return {
			success: true,
			message: res.data.message,
			status: res.status,
			data: null,
		} as CustomResponse<null>;
	} catch (error: any) {
		console.error(error);
		return {
			success: false,
			message: error.response?.data?.message || error.response?.data?.error || "Something went wrong",
			status: error.status,
			data: null,
		} as CustomResponse<null>;
	}
}

export async function resetPassword(payload: ResetPasswordPayload) {
	const url = `${BaseUrl}/auth/reset-password`;
	try {
		const res = await axios.post(url, {
			otp: payload.otp,
			new_password: payload.newPassword,
		}, {
			headers: customHeader(null),
		});
		return {
			success: true,
			message: res.data.message,
			status: res.status,
			data: null,
		} as CustomResponse<null>;
	} catch (error: any) {
		console.error(error);
		return {
			success: false,
			message: error.response?.data?.message || error.response?.data?.error || "Something went wrong",
			status: error.status,
			data: null,
		} as CustomResponse<null>;
	}
}
