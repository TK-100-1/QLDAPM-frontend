import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { Observable, from, switchMap, map, catchError, of } from "rxjs";
import { tokenService } from "./token.service";

const BaseUrl =
	process.env.NEXT_PUBLIC_BASE_URL || "https://a2-price.thuanle.me";

class HttpService {
	private client: AxiosInstance;
	private isRefreshing = false;

	constructor() {
		this.client = axios.create({
			baseURL: BaseUrl,
			withCredentials: true,
			headers: { "Content-Type": "application/json" },
		});

		this.client.interceptors.request.use((config) => {
			const token = tokenService.getToken();
			if (token) {
				config.headers.Cookie = `token=${token}`;
			}
			return config;
		});
	}

	get<T>(url: string, config?: AxiosRequestConfig): Observable<CustomResponse<T>> {
		return this.request<T>({ ...config, method: "GET", url });
	}

	post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Observable<CustomResponse<T>> {
		return this.request<T>({ ...config, method: "POST", url, data });
	}

	put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Observable<CustomResponse<T>> {
		return this.request<T>({ ...config, method: "PUT", url, data });
	}

	delete<T>(url: string, config?: AxiosRequestConfig): Observable<CustomResponse<T>> {
		return this.request<T>({ ...config, method: "DELETE", url });
	}

	private request<T>(config: AxiosRequestConfig): Observable<CustomResponse<T>> {
		return from(this.client.request(config)).pipe(
			map((res) => ({
				status: res.status,
				message: res.data?.message ?? "",
				success: true,
				data: res.data as T,
			})),
			catchError((error) => {
				const status = error.response?.status;

				if (status === 401 && !this.isRefreshing) {
					return this.handleTokenRefresh<T>(config);
				}

				const message =
					error.response?.data?.message ??
					error.response?.data?.error ??
					"Something went wrong";

				return of({
					status: status ?? 0,
					message,
					success: false,
					data: null as T,
				});
			})
		);
	}

	private handleTokenRefresh<T>(originalConfig: AxiosRequestConfig): Observable<CustomResponse<T>> {
		this.isRefreshing = true;

		return from(
			this.client.get("/auth/refreshToken")
		).pipe(
			switchMap((res) => {
				this.isRefreshing = false;

				const setCookie: string[] | undefined = res.headers["set-cookie"];
				const token = setCookie?.[0]?.split(";")?.[0]?.split("=")?.[1]
					?? res.data?.token;

				if (token) {
					tokenService.setToken(token);
				}

				return this.request<T>(originalConfig);
			}),
			catchError(() => {
				this.isRefreshing = false;
				tokenService.clearToken();

				return of({
					status: 401,
					message: "Session expired. Please sign in again.",
					success: false,
					data: null as T,
				});
			})
		);
	}
}

export const httpService = new HttpService();
