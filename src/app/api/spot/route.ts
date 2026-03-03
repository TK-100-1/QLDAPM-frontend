import axios from "axios";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { BaseUrl, customHeader } from "@/src/libs";

export async function GET(req: NextRequest): Promise<Response> {
	const cookieStore = cookies();
	const token = cookieStore.get("token")?.value;

	try {
		if (!token) {
			return new Response("Unauthorized: Token is missing", { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const symbol = searchParams.get("symbol") || searchParams.get("symbols");

		if (!symbol) {
			return new Response("Bad Request: Missing symbol", { status: 400 });
		}

		const response = await axios.get(
			`${BaseUrl}/api/v1/spot-price?symbol=${symbol}`,
			{ headers: customHeader(token) }
		);

		return Response.json(response.data);
	} catch (error: any) {
		const status = error.response?.status ?? 500;
		const message = error.response?.data?.error ?? "Failed to fetch spot price";
		return new Response(message, { status });
	}
}
