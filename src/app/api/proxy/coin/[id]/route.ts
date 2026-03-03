import { NextRequest, NextResponse } from "next/server";

export async function GET(
	_req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const token = process.env.geckoToken2;
	const url = `https://api.coingecko.com/api/v3/coins/${params.id}`;

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
				{ message: errorData.error ?? "Failed to fetch coin detail" },
				{ status: res.status }
			);
		}

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch {
		return NextResponse.json(
			{ message: "Failed to fetch coin detail" },
			{ status: 500 }
		);
	}
}
