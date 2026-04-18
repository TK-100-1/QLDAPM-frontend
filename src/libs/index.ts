export const BaseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://a2-price.thuanle.me';

export const ServerUrl = process.env.NEXT_PUBLIC_SERVER_URL;
// export function customHeader(token: string | null | undefined) {
// 	if (!token) {
// 		return {
// 			"Content-Type": "application/json",
// 		};
// 	}
// 	return {
// 		"Content-Type": "application/json",
// 		Cookie: `token=${token}`,
// 	};
// }

export function customHeader(token: string | null | undefined) {
    if (!token) {
        return {
            'Content-Type': 'application/json',
        };
    }
    return {
        'Content-Type': 'application/json',
        Authorization: token,
    };
}
