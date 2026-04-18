'use client';

import { CoinData } from '@/src/types/coin';
import { Select, SelectItem } from '@nextui-org/react';
import { useEffect, useMemo, useState } from 'react';

const CLIENT_CACHE_TTL_MS = 30 * 60 * 1000;

let coinCache: {
    data: CoinData[];
    expiresAt: number;
} | null = null;

interface Props {
    value: string;
    onValueChange: (symbol: string) => void;
    label?: string;
    placeholder?: string;
}

export default function CoinSymbolSelect({
    value,
    onValueChange,
    label = 'Coin',
    placeholder = 'Select a coin',
}: Props) {
    const [coins, setCoins] = useState<CoinData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadCoins = async () => {
            if (coinCache && coinCache.expiresAt > Date.now()) {
                setCoins(coinCache.data);
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    '/api/proxy/coin/list?vs_currency=usd&page=1&per_page=100',
                );

                if (!response.ok) {
                    setCoins([]);
                    return;
                }

                const data = (await response.json()) as CoinData[];
                setCoins(data);
                coinCache = {
                    data,
                    expiresAt: Date.now() + CLIENT_CACHE_TTL_MS,
                };
            } catch {
                setCoins([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadCoins();
    }, []);

    const options = useMemo(
        () =>
            coins.map((coin) => ({
                key: coin.symbol,
                label: `${coin.name} (${coin.symbol.toUpperCase()})`,
            })),
        [coins],
    );

    return (
        <Select
            label={label}
            placeholder={placeholder}
            radius="sm"
            isLoading={isLoading}
            selectedKeys={value ? [value] : []}
            onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                if (typeof selected === 'string') {
                    onValueChange(selected);
                }
            }}
        >
            {options.map((option) => (
                <SelectItem
                    key={option.key}
                    value={option.key}
                    textValue={option.label}
                >
                    {option.label}
                </SelectItem>
            ))}
        </Select>
    );
}
