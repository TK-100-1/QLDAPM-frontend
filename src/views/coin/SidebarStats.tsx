"use client";
import {
	CoinDetailData,
	SpotPriceData,
	FuturePriceData,
} from "@/src/types/coin";
import { CaretRight } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

interface Props {
	coinDetail: CoinDetailData;
}

export default function SidebarStats({ coinDetail }: Props) {
	const [spot, setSpot] = useState<SpotPriceData | null>(null);
	const [future, setFuture] = useState<FuturePriceData | null>(null);

	useEffect(() => {
		const symbol = coinDetail.symbol.toUpperCase() === "USDT" ? null : coinDetail.symbol.toUpperCase() + "USDT";

		async function fetchAll() {
			if (!symbol) return;
			try {
				const [spotRes, futureRes] = await Promise.allSettled([
					fetch(`/api/spot?symbol=${symbol}`),
					fetch(`/api/future?symbol=${symbol}`),
				]);

				if (spotRes.status === "fulfilled" && spotRes.value.ok) {
					const spotData = (await spotRes.value.json()) as SpotPriceData;
					setSpot(spotData);
				}

				if (futureRes.status === "fulfilled" && futureRes.value.ok) {
					const futureData = (await futureRes.value.json()) as FuturePriceData;
					setFuture(futureData);
				}
			} catch (err) {
				console.error("Failed to fetch price data:", err);
			}
		}

		fetchAll();
	}, [coinDetail.symbol]);

	const StatItem = ({ label, value }: { label: string; value: string }) => (
		<div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors px-1">
			<span className="text-slate-500 text-sm font-medium">{label}</span>
			<div className="flex items-center gap-1">
				<span className="text-slate-900 font-bold text-sm tracking-tight">{value}</span>
				<CaretRight size={14} className="text-slate-300" weight="bold" />
			</div>
		</div>
	);

	return (
		<div className="flex flex-col w-full bg-white rounded-xl shadow-[0_0_1px_rgba(0,0,0,0.1)] p-2">
			{coinDetail.market_data.market_cap.usd != null && (
				<StatItem 
					label="Market Cap" 
					value={`$${coinDetail.market_data.market_cap.usd.toLocaleString()}`} 
				/>
			)}
			{coinDetail.market_data.fully_diluted_valuation.usd != null && (
				<StatItem 
					label="Fully Diluted Valuation" 
					value={`$${coinDetail.market_data.fully_diluted_valuation.usd.toLocaleString()}`} 
				/>
			)}
			{coinDetail.market_data.total_volume.usd != null && (
				<StatItem 
					label="Total Trading Volume" 
					value={`$${coinDetail.market_data.total_volume.usd.toLocaleString()}`} 
				/>
			)}
			{coinDetail.market_data.circulating_supply != null && (
				<StatItem 
					label="Circulating Supply" 
					value={coinDetail.market_data.circulating_supply.toLocaleString()} 
				/>
			)}
			{coinDetail.market_data.total_supply != null && (
				<StatItem 
					label="Total Supply" 
					value={coinDetail.market_data.total_supply.toLocaleString()} 
				/>
			)}
			{coinDetail.market_data.max_supply != null && (
				<StatItem 
					label="Max Supply" 
					value={coinDetail.market_data.max_supply.toLocaleString()} 
				/>
			)}
		</div>
	);
}
