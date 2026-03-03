import { Observable } from "rxjs";
import { httpService } from "../http";
import {
	ChangePasswordPayload,
	ChangeEmailPayload,
	DepositCoinPayload,
	PurchaseVIPPayload,
	BasicUserInfo,
} from "@/src/types/user";

export function fetchInfo(): Observable<CustomResponse<BasicUserInfo>> {
	return httpService.get("/info");
}

export function changePassword(
	payload: ChangePasswordPayload
): Observable<CustomResponse<null>> {
	return httpService.put("/api/changePassword", payload);
}

export function changeEmail(
	payload: ChangeEmailPayload
): Observable<CustomResponse<null>> {
	return httpService.put(`/api/changeEmail?email=${payload.email}`, {});
}

export function deposit(
	payload: DepositCoinPayload
): Observable<CustomResponse<null>> {
	return httpService.put(`/api/deposit?amount=${payload.amount}`, {});
}

export function purchaseVIP(
	payload: PurchaseVIPPayload
): Observable<CustomResponse<null>> {
	return httpService.put(
		`/api/purchaseVip?vipLevel=${payload.vipLevel}`,
		{}
	);
}
