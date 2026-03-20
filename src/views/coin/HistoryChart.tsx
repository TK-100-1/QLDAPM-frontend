"use client";
import FlexBox from "@/src/components/Box/FlexBox";
import { H1 } from "@/src/components/Heading";
import { fetchCoinHistory } from "@/src/libs/serverAction/coin";
import { CoinHistoryData } from "@/src/types/coin";
import { Tab, Tabs } from "@nextui-org/react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Filler,
	ScriptableContext,
} from "chart.js";
import moment from "moment";
import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";

const verticalLinePlugin = {
	id: "verticalLine",
	beforeDraw: (chart: any) => {
		if (!chart.tooltip) return;

		if (chart.tooltip._active && chart.tooltip._active.length) {
			const ctx = chart.ctx;
			const activePoint = chart.tooltip._active[0];
			const x = activePoint.element.x;
			const topY = chart.scales.y.top;
			const bottomY = chart.scales.y.bottom;

			ctx.save();
			ctx.beginPath();
			ctx.moveTo(x, topY);
			ctx.lineTo(x, bottomY);
			ctx.lineWidth = 1;
			ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
			ctx.stroke();
			ctx.restore();
		}
	},
};

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Filler,
	verticalLinePlugin
);

interface Props {
	id: string;
	historyData: CoinHistoryData;
}

export default function HistoryChart({ id, historyData }: Props) {
	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const [currentHistory, setCurrentHistory] = useState<CoinHistoryData[]>([
		historyData,
		null as any,
		null as any,
		null as any,
		null as any,
	]);

	const coinChartData = useMemo(() => {
		return currentHistory[currentIndex].prices.map((value) => {
			return {
				timeStamp: value[0],
				price: value[1],
			};
		});
	}, [currentIndex, currentHistory]);

	const data = useMemo(() => {
		return {
			labels: coinChartData.map((value) => {
				const date = new Date(value.timeStamp);
				return `${date.toDateString()} - ${date.toLocaleTimeString()}`;
			}),
			datasets: [
				{
					fill: true,
					label: id,
					data: coinChartData.map((val) => ({
						x: val.timeStamp,
						y: val.price,
					})),
					borderColor: "rgb(53, 162, 235)",
					backgroundColor: (context: ScriptableContext<"line">) => {
						const ctx = context.chart.ctx;
						const gradient = ctx.createLinearGradient(0, 0, 0, 450);
						gradient.addColorStop(0, "rgba(53, 162, 235, 0.5)"); // Start color
						gradient.addColorStop(1, "rgba(53, 162, 235, 0)");
						return gradient;
					},
					pointRadius: 0,
					pointHoverRadius: 0,
					pointHitRadius: 10,
				},
			],
		};
	}, [currentIndex, coinChartData, id]);

	const options = {
		responsive: true,
		scales: {
			y: {
				position: "right",
				ticks: {
					maxTicksLimit: 12,
					callback: function (value: number) {
						return "$" + value;
					},
				},
			},
			x: {
				grid: {
					display: false,
				},
				ticks: {
					maxTicksLimit: 8,
					callback: function (value: number) {
						const date = new Date(coinChartData[value].timeStamp);
						switch (currentIndex) {
							case 0:
								return date.toLocaleTimeString();
							case 1:
								return moment(date).format("MMM DD");
							case 2:
								return moment(date).format("MMM DD");
							case 3:
								return moment(date).format("MMM DD");
							case 4:
								return moment(date).format("MMM DD");
							default:
								return date.toDateString();
						}
					},
				},
			},
		},
		plugins: {
			tooltip: {
				mode: "index",
				intersect: false,
			},
		},
		interaction: {
			mode: "index",
			intersect: false,
		},
	};

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900">History Price</h2>
        <Tabs
          variant="solid"
          size="sm"
          radius="sm"
          classNames={{
            tabList: "bg-slate-50 p-1 border border-slate-100",
            cursor: "bg-white shadow-sm",
            tab: "px-4 font-bold text-slate-400 data-[selected=true]:text-slate-900",
          }}
          onSelectionChange={(key) => {
            const time = key.toString();
            let index = 0;
            switch (time) {
              case "1": index = 0; break;
              case "7": index = 1; break;
              case "30": index = 2; break;
              case "90": index = 3; break;
              case "365": index = 4; break;
              default: index = 0;
            }
            if (currentHistory[index] == null) {
              fetchCoinHistory(id, "usd", parseInt(time)).then((res) => {
                if (res.success && res.data) {
                  const newHistory = [...currentHistory];
                  newHistory[index] = res.data;
                  setCurrentHistory(newHistory);
                  setCurrentIndex(index);
                }
              });
            } else {
              setCurrentIndex(index);
            }
          }}>
          <Tab key="1" title="24h" />
          <Tab key="7" title="7 days" />
          <Tab key="30" title="1 month" />
          <Tab key="90" title="3 month" />
          <Tab key="365" title="1 year" />
        </Tabs>
      </div>
      
      <div className="w-full h-[400px] bg-white rounded-2xl border border-slate-100 p-6 shadow-sm relative overflow-hidden group">
        <Line 
          options={{
            ...options,
            maintainAspectRatio: false,
          } as any} 
          data={{
            ...data,
            datasets: [
              {
                ...data.datasets[0],
                borderColor: "rgba(37, 99, 235, 1)",
                borderWidth: 2.5,
                backgroundColor: (context: ScriptableContext<"line">) => {
                  const ctx = context.chart.ctx;
                  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                  gradient.addColorStop(0, "rgba(37, 99, 235, 0.1)");
                  gradient.addColorStop(1, "rgba(37, 99, 235, 0)");
                  return gradient;
                },
              }
            ]
          }} 
        />
      </div>
    </div>
  );
}
