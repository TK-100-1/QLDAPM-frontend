import { NextRequest, NextResponse } from 'next/server';

type CacheEntry = {
    data: unknown;
    expiresAt: number;
};

const CACHE_TTL_MS = 30 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

async function getFallbackCoins(page: number, perPage: number) {
    const fallbackCoins = (
        await import('../../../../../libs/serverFetch/mockCoinList.json')
    ).default as unknown[];

    const start = Math.max(0, (page - 1) * perPage);
    const end = start + perPage;
    return fallbackCoins.slice(start, end);
}

export async function GET(req: NextRequest) {
    const token = process.env.geckoToken;
    const { searchParams } = new URL(req.url);
    const vsCurrency = searchParams.get('vs_currency') || 'usd';
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const perPage = Number.parseInt(searchParams.get('per_page') || '100', 10);
    const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
    const safePerPage =
        Number.isNaN(perPage) || perPage < 1 ? 100 : Math.min(perPage, 250);
    const cacheKey = `${vsCurrency}:${safePage}:${safePerPage}`;

    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        return NextResponse.json(cached.data, {
            status: 200,
            headers: {
                'x-coin-cache': 'HIT',
            },
        });
    }

    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vsCurrency}&page=${safePage}&per_page=${safePerPage}`;

    try {
        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': token ?? '',
            },
            next: {
                revalidate: 1800,
            },
        });

        if (!res.ok) {
            if (cached) {
                return NextResponse.json(cached.data, {
                    status: 200,
                    headers: {
                        'x-coin-cache': 'STALE',
                    },
                });
            }

            const fallbackData = await getFallbackCoins(safePage, safePerPage);
            return NextResponse.json(fallbackData, {
                status: 200,
                headers: {
                    'x-coin-cache': 'FALLBACK',
                },
            });
        }

        const data = await res.json();
        cache.set(cacheKey, {
            data,
            expiresAt: Date.now() + CACHE_TTL_MS,
        });

        return NextResponse.json(data, {
            status: res.status,
            headers: {
                'x-coin-cache': 'MISS',
            },
        });
    } catch {
        if (cached) {
            return NextResponse.json(cached.data, {
                status: 200,
                headers: {
                    'x-coin-cache': 'STALE',
                },
            });
        }

        const fallbackData = await getFallbackCoins(safePage, safePerPage);
        return NextResponse.json(fallbackData, {
            status: 200,
            headers: {
                'x-coin-cache': 'FALLBACK',
            },
        });
    }
}
