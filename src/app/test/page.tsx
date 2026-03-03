"use client";
import FlexBox from "@/src/components/Box/FlexBox";
import Container from "@/src/components/Container";
import { H1 } from "@/src/components/Heading";
import {
  FundingRateData,
  FuturePriceData,
  KlineData,
  SpotPriceData,
} from "@/src/types/coin";
import { useEffect, useState } from "react";

export default function Page() {
  const [spot, setSpot] = useState<SpotPriceData | null>(null);
  const [future, setFuture] = useState<FuturePriceData | null>(null);
  const [funding, setFunding] = useState<FundingRateData | null>(null);
  const [kline, setKline] = useState<KlineData | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [spotRes, futureRes, fundingRes, klineRes] = await Promise.allSettled([
          fetch("/api/spot?symbol=BTCUSDT"),
          fetch("/api/future?symbol=BTCUSDT"),
          fetch("/api/funding?symbol=BTCUSDT"),
          fetch("/api/kline?symbol=BTCUSDT"),
        ]);

        if (spotRes.status === "fulfilled" && spotRes.value.ok) {
          setSpot((await spotRes.value.json()) as SpotPriceData);
        }
        if (futureRes.status === "fulfilled" && futureRes.value.ok) {
          setFuture((await futureRes.value.json()) as FuturePriceData);
        }
        if (fundingRes.status === "fulfilled" && fundingRes.value.ok) {
          setFunding((await fundingRes.value.json()) as FundingRateData);
        }
        if (klineRes.status === "fulfilled" && klineRes.value.ok) {
          setKline((await klineRes.value.json()) as KlineData);
        }
      } catch (err) {
        console.error("Failed to fetch price data:", err);
      }
    }

    fetchAll();
  }, []);

  const latestKline =
    kline && kline.kline_data.length > 0
      ? kline.kline_data[kline.kline_data.length - 1]
      : null;

  return (
    <Container>
      <FlexBox className="w-10/12 gap-4">
        {spot && (
          <FlexBox className="flex-col gap-2">
            <H1>Spot</H1>
            <span>{`${parseFloat(spot.price).toFixed(2)}$`}</span>
          </FlexBox>
        )}
        {future && (
          <FlexBox className="flex-col gap-2">
            <H1>Future</H1>
            <span>{`${parseFloat(future.price).toFixed(2)}$`}</span>
          </FlexBox>
        )}
        {funding && (
          <FlexBox className="flex-col gap-2">
            <H1>Funding Rate</H1>
            <span>{`${parseFloat(funding.fundingRate)}%`}</span>
          </FlexBox>
        )}
        {latestKline && (
          <FlexBox className="flex-col gap-2">
            <H1>Kline</H1>
            <span>{`${latestKline.high.toFixed(2)}$`}</span>
          </FlexBox>
        )}
      </FlexBox>
    </Container>
  );
}
