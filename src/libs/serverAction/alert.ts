"use server";

import axios from "axios";
import { BaseUrl, customHeader } from "..";
import {
  CreateIndicatorTriggerPayload,
  CreateSnoozePayload,
  CreateTriggerPayload,
  CreateUserIndicatorPayload,
  DeleteIndicatorTriggerPayload,
  DeleteTriggerPayload,
} from "@/src/types/alert";
import { cookies } from "next/headers";

export async function CreateSnoozeAlert(payload: CreateSnoozePayload) {
	const cookieStore = cookies();
	const token = cookieStore.get("token")?.value;
	// Map snooze to the general alerts creation endpoint as backend handles it via req.body
	const url = `${BaseUrl}/vip2/alerts`; 

	try {
		const res = await axios.post(url, {
			...payload,
			type: payload.triggerType,
			snooze_condition: payload.conditionType, // Align with backend model
		}, {
			headers: customHeader(token),
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
			message: error.response?.data?.error || "Failed to create snooze alert",
			status: error.status,
			data: null,
		} as CustomResponse<null>;
	}
}

export async function CreateTriggerAlert(payload: CreateTriggerPayload) {
	const cookieStore = cookies();
	const token = cookieStore.get("token")?.value;
	const url = `${BaseUrl}/vip2/alerts`;

	try {
		const res = await axios.post(url, {
			...payload,
			type: payload.triggerType,
			threshold: payload.price, // Align with backend checker
		}, {
			headers: customHeader(token),
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
			message: error.response?.data?.error || "Failed to create trigger alert",
			status: error.status,
			data: null,
		} as CustomResponse<null>;
	}
}

export async function CreateIndicatorAlert(
	payload: CreateIndicatorTriggerPayload
) {
	const cookieStore = cookies();
	const token = cookieStore.get("token")?.value;
	// Use indicators endpoint
	const url = `${BaseUrl}/vip3/indicators`;

	try {
		const res = await axios.post(url, {
			symbol: payload.symbol,
			indicator: payload.indicators,
			period: 14, // Default period as frontend doesn't have it yet
			notification_method: payload.notification_method,
			threshold: payload.price,
		}, {
			headers: customHeader(token),
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
			message: error.response?.data?.error || "Failed to create indicator alert",
			status: error.status,
			data: null,
		} as CustomResponse<null>;
	}
}

export async function CreateUserIndicatorAlert(
	payload: CreateUserIndicatorPayload
) {
	const cookieStore = cookies();
	const token = cookieStore.get("token")?.value;
	// Map to indicators endpoint
	const url = `${BaseUrl}/vip3/indicators`;

	try {
		const res = await axios.post(url, {
			name: payload.name,
			indicator: 'Custom',
			code: payload.code,
			period: 14,
			notification_method: 'telegram', // Default
		}, {
			headers: customHeader(token),
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
			message: error.response?.data?.error || "Failed to create custom indicator alert",
			status: error.status,
			data: null,
		} as CustomResponse<null>;
	}
}

export async function DeleteTrigger(payload: { id: string }) {
	const cookieStore = cookies();
	const token = cookieStore.get("token")?.value;
	const url = `${BaseUrl}/vip2/alerts/${payload.id}`;

	try {
		const res = await axios.delete(url, {
			headers: customHeader(token),
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
			message: error.response?.data?.error || "Failed to delete alert",
			status: error.status,
			data: null,
		} as CustomResponse<null>;
	}
}

export async function DeleteIndicatorTrigger(payload: { id: string }) {
	// Re-use vip2 delete as indicator results are also in 'alerts' collection
	return DeleteTrigger(payload);
}
