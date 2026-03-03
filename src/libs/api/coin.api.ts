import { Observable } from "rxjs";
import { httpService } from "../http";
import { BasicUserInfo } from "@/src/types/user";
import {
	CoinData,
	CoinDetailData,
	CoinHistoryData,
} from "@/src/types/coin";

export function fetchCoinList(
	currency: string,
	page: number
): Observable<CustomResponse<CoinData[]>> {
	return httpService.get<CoinData[]>(
		`/api/proxy/coin/list?vs_currency=${currency}&page=${page}`
	);
}

export function fetchCoinDetail(
	id: string
): Observable<CustomResponse<CoinDetailData>> {
	return httpService.get<CoinDetailData>(`/api/proxy/coin/${id}`);
}

export function fetchCoinHistory(
	id: string,
	currency: string,
	day: number
): Observable<CustomResponse<CoinHistoryData>> {
	return httpService.get<CoinHistoryData>(
		`/api/proxy/coin/${id}/history?vs_currency=${currency}&days=${day}`
	);
}

export function fetchInfo(): Observable<CustomResponse<BasicUserInfo>> {
	return httpService.get("/info");
}
