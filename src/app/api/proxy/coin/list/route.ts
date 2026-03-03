import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const token = process.env.geckoToken;
	const { searchParams } = new URL(req.url);
	const vsCurrency = searchParams.get("vs_currency") || "usd";
	const page = searchParams.get("page") || "1";

	const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vsCurrency}&page=${page}`;

	try {
		const res = await fetch(url, {
			headers: {
				"Content-Type": "application/json",
				"api-key": token ?? "",
			},
		});

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			return NextResponse.json(
				{ message: errorData.error ?? "Failed to fetch coin list" },
				{ status: res.status }
			);
		}

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch {
		return NextResponse.json(
			{ message: "Failed to fetch coin list" },
			{ status: 500 }
		);
	}
}
