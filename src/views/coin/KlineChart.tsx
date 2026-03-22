"use client";
import { KlineData } from "@/src/types/coin";
import { Chip, Select, SelectItem, Spinner, Slider } from "@nextui-org/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler,
  Legend
} from "chart.js";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { Line, Bar, Chart } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler,
  Legend
);

interface Props {
  symbol: string;
}

export default function KlineChart({ symbol }: Props) {
  const [loading, setLoading] = useState(true);
  const [interval, setIntervalValue] = useState("1h");
  const [viewRange, setViewRange] = useState<[number, number]>([0, 100]); // Percentage range [start, end]
  const [data, setData] = useState<KlineData | null>(null);

  // Sync range when data loads
  useEffect(() => {
    if (data && data.kline_data.length > 0) {
      // Initially show the last 50 candles
      const total = data.kline_data.length;
      const startPercent = Math.max(0, ((total - 50) / total) * 100);
      setViewRange([startPercent, 100]);
    }
  }, [data]);

  useEffect(() => {
    async function fetchKline() {
      if (symbol.toUpperCase() === "USDT") {
        setLoading(false);
        return;
      }
      setLoading(true);
      const symbolUpper = symbol.toUpperCase() + "USDT";
      try {
        const res = await fetch(`/api/kline?symbol=${symbolUpper}&interval=${interval}`);
        if (res.ok) {
          const klineData = await res.json();
          setData(klineData);
        }
      } catch (err) {
        console.error("Failed to fetch kline data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchKline();
  }, [symbol, interval]);

  const chartData = useMemo(() => {
    if (!data || data.kline_data.length === 0) return null;

    const total = data.kline_data.length;
    const startIndex = Math.floor((viewRange[0] / 100) * total);
    const endIndex = Math.ceil((viewRange[1] / 100) * total);
    
    const visibleData = data.kline_data.slice(startIndex, endIndex);
    if (visibleData.length === 0) return null;

    const labels = visibleData.map(k => moment(k.time).format("HH:mm"));
    
    const calculateMA = (days: number) => {
      const ma = data.kline_data.map((_, idx, arr) => {
        if (idx < days - 1) return null;
        const slice = arr.slice(idx - days + 1, idx + 1);
        const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
        return sum / days;
      });
      return ma.slice(startIndex, endIndex);
    };

    const ma7 = calculateMA(7);
    const ma25 = calculateMA(25);

    return {
      labels,
      datasets: [
        {
          label: "MA7",
          data: ma7,
          type: 'line' as const,
          borderColor: "rgba(59, 130, 246, 0.8)",
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.4,
        },
        {
          label: "MA25",
          data: ma25,
          type: 'line' as const,
          borderColor: "rgba(245, 158, 11, 0.8)",
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.4,
        },
        {
          label: "Candle Body",
          data: visibleData.map(k => [k.open, k.close]),
          type: 'bar' as const,
          backgroundColor: visibleData.map(k => k.close >= k.open ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)"),
          borderColor: visibleData.map(k => k.close >= k.open ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"),
          borderWidth: 1,
          barPercentage: 0.8,
        },
        {
          label: "Wick",
          data: visibleData.map(k => [k.low, k.high]),
          type: 'bar' as const,
          backgroundColor: visibleData.map(k => k.close >= k.open ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)"),
          borderColor: visibleData.map(k => k.close >= k.open ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"),
          borderWidth: 1,
          barPercentage: 0.1,
          grouped: false,
        }
      ]
    };
  }, [data, viewRange]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: { weight: 'bold' as any },
          filter: (item: any) => !['Candle Body', 'Wick'].includes(item.text)
        }
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            if (context.dataset.label === "Candle Body") {
              const raw = context.raw;
              return [`Open: ${raw[0]}`, `Close: ${raw[1]}`];
            }
            if (context.dataset.label === "Wick") {
              const raw = context.raw;
              return [`Low: ${raw[0]}`, `High: ${raw[1]}`];
            }
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { maxTicksLimit: 12 }
      },
      y: {
        stacked: false,
        position: 'right' as const,
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: {
          callback: (value: any) => `$${value.toLocaleString()}`
        }
      }
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-900">Kline Chart</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-blue-500"></div>
              <span className="text-[10px] font-bold text-slate-400">MA7</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-orange-500"></div>
              <span className="text-[10px] font-bold text-slate-400">MA25</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            size="sm" 
            label="Interval" 
            className="max-w-[120px]"
            selectedKeys={[interval]}
            onChange={(e) => setIntervalValue(e.target.value)}
          >
            <SelectItem key="1m" value="1m">1 minute</SelectItem>
            <SelectItem key="5m" value="5m">5 minutes</SelectItem>
            <SelectItem key="15m" value="15m">15 minutes</SelectItem>
            <SelectItem key="1h" value="1h">1 hour</SelectItem>
            <SelectItem key="4h" value="4h">4 hours</SelectItem>
            <SelectItem key="1d" value="1d">1 day</SelectItem>
          </Select>
        </div>
      </div>

      <div className="w-full h-[450px] bg-white rounded-2xl border border-slate-100 p-6 shadow-sm relative overflow-hidden group min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] z-10">
            <Spinner label="Loading price action..." color="primary" />
          </div>
        ) : chartData ? (
          <Chart type="bar" options={options as any} data={chartData as any} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            No kline data available.
          </div>
        )}
      </div>

      {!loading && data && data.kline_data.length > 0 && (
        <div className="px-6 py-4 bg-slate-50 rounded-xl border border-slate-100">
          <Slider 
            label="Time Range Filter (Resize to Zoom)" 
            size="sm"
            step={1} 
            maxValue={100} 
            minValue={0} 
            value={viewRange}
            onChange={(v: number | number[]) => setViewRange(v as [number, number])}
            classNames={{
              label: "text-[10px] font-bold text-slate-400 uppercase mb-2",
              value: "hidden"
            }}
            renderValue={(props) => (
              <div {...props} className="flex gap-4 text-[10px] font-bold text-blue-600">
                <span>{moment(data.kline_data[Math.floor((viewRange[0]/100) * (data.kline_data.length-1))].time).format("HH:mm")}</span>
                <span>-</span>
                <span>{moment(data.kline_data[Math.floor((viewRange[1]/100) * (data.kline_data.length-1))].time).format("HH:mm")}</span>
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}
