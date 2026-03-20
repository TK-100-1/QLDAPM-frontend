import { cookies } from "next/headers";
import { BaseUrl } from "..";
import axios from "axios";
import { BasicUserInfo } from "@/src/types/user";
import { IndicatorTrigerData, TriggerConditionData } from "@/src/types/alert";
import { CoinData, CoinDetailData, CoinHistoryData } from "@/src/types/coin";
// import mockCoinData from "./mockCoinData.json";
// import mockHistoryData from "./mockHistoryData.json";

export async function refreshToken() {
	const cookieStore = cookies();
	const token = cookieStore.get("token")?.value;
	if (!token) {
		console.log("[refreshToken] No token in cookie, skipping refresh");
		return {
			success: false,
			message: "No token found",
			status: 401,
			data: null,
		} as CustomResponse<null>;
	}
	try {
		const res = await axios.post(`${BaseUrl}/auth/refresh-token`, {}, {
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
		});
		console.log("[refreshToken] response:", res.status, "newToken:", !!res.data.token);
		const newToken = res.data.token;
		if (!newToken) {
			return {
				success: false,
				message: "Something went wrong",
				status: 404,
				data: null,
			} as CustomResponse<null>;
		}
		// Update the cookie with the new token
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
		console.error("[refreshToken] error:", error.response?.status, error.response?.data);
		return {
			success: false,
			message: error.response?.data?.message ?? "Failed to refresh token",
			status: error.status,
			data: null,
		} as CustomResponse<null>;
	}
}

export async function fetchInfo() {
	const cookieStore = cookies();
	const token = cookieStore.get("token")?.value;
	console.log("[fetchInfo] using token:", token ? token.slice(0, 20) + "..." : "NONE");
	const url = `${BaseUrl}/user/me`;

	try {
		const response = await axios.get(url, {
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
		});

		return {
			success: true,
			message: "",
			status: response.status,
			data: response.data,
		} as CustomResponse<BasicUserInfo>;
	} catch (error: any) {
		console.error("[fetchInfo] error:", error.response?.status, error.response?.data);
		return {
			success: false,
			message: "",
			status: error.status,
			data: null,
		} as CustomResponse<null>;
	}
}

export async function fetchAlerts() {
	const cookieStore = cookies();
	const token = cookieStore.get("token")?.value;
	const url = `${BaseUrl}/vip2/alerts`;

	try {
		const res = await axios.get(url, {
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
		});

		const triggerList: TriggerConditionData[] = [];
		const indicatorList: IndicatorTrigerData[] = [];
		const list: any[] = res.data;

		for (const item of list) {
			const mappedItem = {
				...item,
				alert_id: item._id, // Map MongoDB _id to alert_id expected by frontend
			};
			if (mappedItem.triggerType == "indicator") {
				indicatorList.push(mappedItem);
			} else {
				triggerList.push(mappedItem);
			}
		}

		return {
			triggerList,
			indicatorList,
		};
	} catch (error) {
		console.error(error);
		return {
			triggerList: [],
			indicatorList: [],
		};
	}
}

export async function fetchCoinList(currency: string, page: number) {
	const token = process.env.geckoToken;
	const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&page=${page}`;
	const header = {
		"Content-Type": "application/json",
		"api-key": token,
	};

	try {
		const res = await axios.get(url, {
			headers: header,
		});

		return {
			success: true,
			message: "",
			status: res.status,
			data: res.data,
		} as CustomResponse<CoinData[]>;
	} catch (error: any) {
		console.error("[fetchCoinList] error:", error.response?.status, error.response?.data);
		return {
			success: false,
			message: error.response?.data?.error ?? "Failed to fetch coin list",
			status: error.status,
			data: [],
		} as CustomResponse<CoinData[]>;
	}
}

export async function fetchCoinDetail(id: string) {
	const token = process.env.geckoToken2;
	const url = `https://api.coingecko.com/api/v3/coins/${id}`;
	const header = {
		"Content-Type": "application/json",
		"api-key": token,
	};

	// return {
	// 	success: true,
	// 	message: "Not implemented",
	// 	status: 404,
	// 	data: mockCoinData as any,
	// } as CustomResponse<CoinDetailData>;

	try {
		const res = await axios.get(url, {
			headers: header,
		});

		return {
			success: true,
			message: "",
			status: res.status,
			data: res.data,
		} as CustomResponse<CoinDetailData>;
	} catch (error: any) {
		return {
			success: false,
			message: error.response.data.error,
			status: error.status,
			data: null,
		} as CustomResponse<null>;
	}
}

export async function fetchCoinHistory(
	id: string,
	currency: string,
	day: number
) {
	const token = process.env.geckoToken3;
	const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=${currency}&days=${day}`;
	const header = {
		"Content-Type": "application/json",
		"api-key": token,
	};

	// return {
	// 	success: true,
	// 	message: "Not implemented",
	// 	status: 404,
	// 	data: mockHistoryData as any,
	// } as CustomResponse<CoinHistoryData>;

	try {
		const res = await axios.get(url, {
			headers: header,
		});

		return {
			success: true,
			message: "",
			status: res.status,
			data: res.data,
		} as CustomResponse<CoinHistoryData>;
	} catch (error: any) {
		return {
			success: false,
			message: error.response.data.error,
			status: error.status,
			data: null,
		} as CustomResponse<null>;
	}
}
export async function searchCoins(query: string) {
	const token = process.env.geckoToken;
	const searchUrl = `https://api.coingecko.com/api/v3/search?query=${query}`;
	const header = {
		"Content-Type": "application/json",
		"api-key": token,
	};

	try {
		const searchRes = await axios.get(searchUrl, {
			headers: header,
		});

		const coins = searchRes.data.coins.slice(0, 10); // Take top 10 results
		if (coins.length === 0) {
			return {
				success: true,
				message: "No coins found",
				status: 200,
				data: [],
			} as CustomResponse<CoinData[]>;
		}

		const ids = coins.map((c: any) => c.id).join(",");
		const marketUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`;
		const marketRes = await axios.get(marketUrl, {
			headers: header,
		});

		return {
			success: true,
			message: "",
			status: marketRes.status,
			data: marketRes.data,
		} as CustomResponse<CoinData[]>;
	} catch (error: any) {
		console.error("[searchCoins] error:", error.response?.status, error.response?.data);
		return {
			success: false,
			message: error.response?.data?.error ?? "Failed to search coins",
			status: error.status,
			data: [],
		} as CustomResponse<CoinData[]>;
	}
}
