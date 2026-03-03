import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const token = process.env.geckoToken3;
	const { searchParams } = new URL(req.url);
	const vsCurrency = searchParams.get("vs_currency") || "usd";
	const days = searchParams.get("days") || "1";

	const url = `https://api.coingecko.com/api/v3/coins/${params.id}/market_chart?vs_currency=${vsCurrency}&days=${days}`;

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
				{ message: errorData.error ?? "Failed to fetch coin history" },
				{ status: res.status }
			);
		}

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch {
		return NextResponse.json(
			{ message: "Failed to fetch coin history" },
			{ status: 500 }
		);
	}
}
