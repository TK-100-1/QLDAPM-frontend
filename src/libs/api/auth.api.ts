import { Observable } from "rxjs";
import { tap, map } from "rxjs/operators";
import { httpService, tokenService } from "../http";
import {
	SignupPayload,
	ForgotPasswordPayload,
	ResetPasswordPayload,
} from "@/src/types/user";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function signin(
	identifier: string,
	password: string,
): Observable<CustomResponse<null>> {
	return httpService
		.post<{ token: string; message: string }>("/auth/login", {
			username: identifier,
			password: password,
		})
		.pipe(
			tap((res) => {
				if (res.success && res.data?.token) {
					tokenService.setToken(res.data.token);
				}
			}),
			map((res) => ({
				status: res.status,
				message: res.message,
				success: res.success,
				data: null,
			}))
		);
}

export function signout(): void {
	tokenService.clearToken();
	if (typeof window !== "undefined") {
		window.location.href = "/signin";
	}
}

export function signup(
	payload: SignupPayload
): Observable<CustomResponse<null>> {
	return httpService.post("/auth/register", payload);
}

export function refreshToken(): Observable<CustomResponse<string>> {
	return httpService.get<string>("/auth/refreshToken").pipe(
		tap((res) => {
			if (res.success && res.data) {
				tokenService.setToken(res.data);
			}
		})
	);
}

export function forgotPassword(
	payload: ForgotPasswordPayload
): Observable<CustomResponse<null>> {
	return httpService.post(`/auth/forgot-password`, { email: payload.email });
}

export function resetPassword(
	payload: ResetPasswordPayload
): Observable<CustomResponse<null>> {
	return httpService.put(
		`/auth/reset-password?email=${payload.email}&otpCode=${payload.otp}`,
		{ newPassword: payload.newPassword }
	);
}
