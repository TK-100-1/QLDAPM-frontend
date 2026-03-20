"use client";
import { CoinHistoryData } from "@/src/types/coin";
import { fetchCoinHistory } from "@/src/libs/serverAction/coin";
import { Button, Slider, Spinner } from "@nextui-org/react";
import { Play, Pause, ArrowsCounterClockwise } from "@phosphor-icons/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import moment from "moment";
import { useEffect, useMemo, useState, useRef } from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

interface Props {
  id: string;
}

export default function MarketReplay({ id }: Props) {
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState<[number, number][]>([]);
  const [visibleData, setVisibleData] = useState<[number, number][]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const playRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetchCoinHistory(id, "usd", 1);
      if (res.success && res.data) {
        setAllData(res.data.prices);
        setVisibleData(res.data.prices.slice(0, 10)); // Start with 10 points
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    if (isPlaying && visibleData.length < allData.length) {
      playRef.current = setInterval(() => {
        setVisibleData(prev => {
          if (prev.length >= allData.length) {
            setIsPlaying(false);
            return prev;
          }
          return [...prev, allData[prev.length]];
        });
      }, 1000 / speed);
    } else {
      if (playRef.current) clearInterval(playRef.current);
    }
    return () => {
      if (playRef.current) clearInterval(playRef.current);
    };
  }, [isPlaying, allData, speed, visibleData.length]);

  const resetReplay = () => {
    setIsPlaying(false);
    setVisibleData(allData.slice(0, 10));
  };

  const chartData = useMemo(() => ({
    labels: visibleData.map(d => moment(d[0]).format("HH:mm:ss")),
    datasets: [{
      label: "Replay Price",
      data: visibleData.map(d => d[1]),
      borderColor: "rgb(245, 158, 11)",
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      fill: true,
      tension: 0.4,
      pointRadius: 0,
    }]
  }), [visibleData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index" as const, intersect: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
      y: { position: 'right' as const, grid: { color: "rgba(0, 0, 0, 0.05)" } }
    },
    animation: { duration: 0 } // Disable animation for smoother point-by-point replay
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Market Replay</h2>
        
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
          <Button 
            isIconOnly 
            size="sm" 
            variant="flat" 
            color="primary"
            onClick={() => setIsPlaying(!isPlaying)}
            isDisabled={loading || visibleData.length >= allData.length}
          >
            {isPlaying ? <Pause size={18} weight="bold" /> : <Play size={18} weight="bold" />}
          </Button>
          
          <Button 
            isIconOnly 
            size="sm" 
            variant="light"
            onClick={resetReplay}
          >
            <ArrowsCounterClockwise size={18} weight="bold" />
          </Button>

          <div className="w-32 px-4">
            <Slider 
              label="Speed" 
              size="sm"
              step={0.5} 
              maxValue={10} 
              minValue={1} 
              value={speed}
              onChange={(v) => setSpeed(v as number)}
              classNames={{
                label: "text-[10px] font-bold text-slate-400 uppercase",
                value: "text-[10px] font-bold text-blue-600"
              }}
            />
          </div>
        </div>
      </div>

      <div className="w-full h-[450px] bg-white rounded-2xl border border-slate-100 p-6 shadow-sm relative overflow-hidden group">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner label="Loading sequence..." />
          </div>
        ) : (
          <Line options={options} data={chartData} />
        )}
      </div>
    </div>
  );
}
