import { BehaviorSubject } from "rxjs";

const TOKEN_KEY = "token";

class TokenService {
	private tokenSubject: BehaviorSubject<string | null>;

	constructor() {
		this.tokenSubject = new BehaviorSubject<string | null>(this.readToken());
	}

	get token$() {
		return this.tokenSubject.asObservable();
	}

	getToken(): string | null {
		return this.tokenSubject.getValue();
	}

	setToken(token: string): void {
		localStorage.setItem(TOKEN_KEY, token);
		document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Lax`;
		this.tokenSubject.next(token);
	}

	clearToken(): void {
		localStorage.removeItem(TOKEN_KEY);
		document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
		this.tokenSubject.next(null);
	}

	private readToken(): string | null {
		if (typeof window === "undefined") return null;
		return localStorage.getItem(TOKEN_KEY);
	}
}

export const tokenService = new TokenService();
