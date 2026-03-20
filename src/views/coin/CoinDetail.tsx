"use client";
import FlexBox from "@/src/components/Box/FlexBox";
import { CoinDetailData, CoinHistoryData } from "@/src/types/coin";
import CustomeBreadcrumbs from "./Breadcrumbs";
import { H1 } from "@/src/components/Heading";
import {
  Accordion,
  AccordionItem,
  Chip,
  Divider,
  Image,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { ArrowDown, ArrowUp, CaretDown } from "@phosphor-icons/react";
import { useState } from "react";
import SidebarStats from "./SidebarStats";
import HistoryChart from "./HistoryChart";
import KlineChart from "./KlineChart";
import MarketReplay from "./MarketReplay";

interface Props {
  coinDetail: CoinDetailData;
  historyData: CoinHistoryData | null;
}

const renderVipRole = (rank: number) => {
  return <Chip radius="sm" className="bg-slate-100 text-slate-500 font-bold border-none">#{rank}</Chip>;
};

export default function CoinDetail({ historyData, coinDetail }: Props) {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);

  return (
    <div className="flex flex-col lg:flex-row w-full gap-12 pt-8">
      {/* Left Sidebar */}
      <div className="w-full lg:w-[320px] flex flex-col gap-8 shrink-0">
        <div className="flex flex-col gap-6">
          <SidebarStats coinDetail={coinDetail} />
          
          <div className="flex flex-col gap-4 mt-4">
            <h3 className="text-xl font-bold text-slate-900 px-1">Category</h3>
            <div className="flex gap-2 flex-wrap px-1">
              {coinDetail.categories.slice(0, 8).map((category) => (
                <Chip 
                  key={category} 
                  radius="sm" 
                  variant="flat"
                  className="bg-slate-100 text-slate-600 text-xs font-medium border-none cursor-default py-1"
                >
                  {category}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-8">
        <div>
          <CustomeBreadcrumbs name={coinDetail.name} />
          
          <div className="flex flex-col gap-6 mt-4">
            <div className="flex items-center gap-4">
              <Image
                src={coinDetail.image.large}
                alt={coinDetail.name}
                className="w-14 h-14"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-slate-900">{coinDetail.name}</h1>
                  {renderVipRole(coinDetail.market_data.market_cap_rank)}
                </div>
                <span className="text-slate-400 font-bold tracking-wider uppercase text-sm">
                  {coinDetail.symbol}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <h2 className="text-5xl font-extrabold text-slate-900 tracking-tight">
                ${coinDetail.market_data.current_price.usd.toLocaleString()}
              </h2>
              {coinDetail.market_data.price_change_percentage_24h != null && (
                <div className={`flex items-center px-3 py-1.5 rounded-full font-bold text-lg ${
                  coinDetail.market_data.price_change_percentage_24h > 0 
                  ? "bg-emerald-50 text-emerald-600" 
                  : "bg-rose-50 text-rose-600"
                }`}>
                  {coinDetail.market_data.price_change_percentage_24h > 0 ? <ArrowUp size={20} weight="bold" /> : <ArrowDown size={20} weight="bold" />}
                  <span className="ml-1">
                    {Math.abs(coinDetail.market_data.price_change_percentage_24h).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Tabs 
          variant="underlined" 
          aria-label="Coin Detail Tabs"
          classNames={{
            base: "border-b border-slate-100 w-full",
            tabList: "gap-8 h-12 p-0",
            cursor: "w-full bg-blue-600 h-[3px]",
            tab: "max-w-fit px-0 h-12 text-slate-400 font-bold data-[selected=true]:text-slate-900",
            tabContent: "group-data-[selected=true]:text-slate-900"
          }}
        >
          <Tab key="history" title="History Price">
            <div className="py-8 flex flex-col gap-12">
              {historyData && (
                <HistoryChart id={coinDetail.id} historyData={historyData} />
              )}
              
              <div className="flex flex-col gap-4">
                <div 
                  className="flex items-center justify-between group cursor-pointer border-b border-slate-100 pb-4"
                  onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                >
                  <h2 className="text-2xl font-bold text-slate-900">Description</h2>
                  <CaretDown 
                    size={20} 
                    className={`text-slate-400 group-hover:text-slate-900 transition-transform ${isDescriptionOpen ? "" : "-rotate-90"}`} 
                  />
                </div>
                {isDescriptionOpen && (
                  <div className="text-slate-600 leading-relaxed text-md space-y-4">
                    {coinDetail.description.en && (
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: coinDetail.description.en.replace(/(?:\r\n|\r|\n)/g, "<br />") 
                        }} 
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </Tab>
          <Tab 
            key="kline" 
            title="Kline Chart"
          >
            <div className="py-8">
              <KlineChart symbol={coinDetail.symbol} />
            </div>
          </Tab>
          <Tab key="replay" title="Market Replay">
            <div className="py-8">
              <MarketReplay id={coinDetail.id} />
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
