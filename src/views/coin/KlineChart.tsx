'use client';
import { KlineData } from '@/src/types/coin';
import { Button, Spinner } from '@nextui-org/react';
import { createChart, ColorType, ISeriesApi, CandlestickData, LineData, CandlestickSeries, LineSeries } from 'lightweight-charts';
import moment from 'moment';
import { useEffect, useRef, useState, useMemo } from 'react';

interface Props {
    symbol: string;
}

const INTERVALS = [
    { label: '1m', value: '1m', description: '1 Minute' },
    { label: '5m', value: '5m', description: '5 Minutes' },
    { label: '15m', value: '15m', description: '15 Minutes' },
    { label: '1h', value: '1h', description: '1 Hour' },
    { label: '4h', value: '4h', description: '4 Hours' },
    { label: '1D', value: '1d', description: '1 Day' },
];

export default function KlineChart({ symbol }: Props) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'>>(null);
    const ma7SeriesRef = useRef<ISeriesApi<'Line'>>(null);
    const ma25SeriesRef = useRef<ISeriesApi<'Line'>>(null);

    const [loading, setLoading] = useState(true);
    const [interval, setIntervalValue] = useState('1h');
    const [data, setData] = useState<KlineData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hoverInfo, setHoverInfo] = useState<{
        time: string;
        open: number;
        high: number;
        low: number;
        close: number;
        change: number;
        changePercent: number;
    } | null>(null);

    // Fetch data
    useEffect(() => {
        async function fetchKline() {
            if (!symbol || symbol.toUpperCase() === 'USDT') {
                setLoading(false);
                setError(null);
                return;
            }
            setLoading(true);
            setError(null);
            const symbolUpper = symbol.toUpperCase() + 'USDT';
            try {
                const res = await fetch(
                    `/api/kline?symbol=${symbolUpper}&interval=${interval}`,
                );
                if (res.ok) {
                    const klineData = await res.json();
                    setData(klineData);
                    setError(null);
                } else if (res.status === 403) {
                    setError('Không đủ VIP để xem dữ liệu này');
                    setData(null);
                } else {
                    setError('Không thể tải dữ liệu');
                    setData(null);
                }
            } catch (err) {
                setError('Lỗi kết nối');
                setData(null);
            } finally {
                setLoading(false);
            }
        }

        fetchKline();
    }, [symbol, interval]);

    // Initialize Chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'white' },
                textColor: '#64748b',
                fontSize: 12,
                fontFamily: 'Inter, sans-serif',
            },
            grid: {
                vertLines: { color: 'rgba(241, 245, 249, 0.8)' },
                horzLines: { color: 'rgba(241, 245, 249, 0.8)' },
            },
            crosshair: {
                mode: 0, // Normal
                vertLine: {
                    width: 1,
                    color: '#94a3b8',
                    style: 2, // Dashed
                },
                horzLine: {
                    width: 1,
                    color: '#94a3b8',
                    style: 2, // Dashed
                },
            },
            rightPriceScale: {
                borderColor: 'rgba(241, 245, 249, 1)',
                autoScale: true,
            },
            timeScale: {
                borderColor: 'rgba(241, 245, 249, 1)',
                timeVisible: true,
                secondsVisible: false,
            },
            handleScroll: true,
            handleScale: true,
        });

        candlestickSeriesRef.current = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        ma7SeriesRef.current = chart.addSeries(LineSeries, {
            color: '#3b82f6',
            lineWidth: 1.5,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
        });

        ma25SeriesRef.current = chart.addSeries(LineSeries, {
            color: '#f59e0b',
            lineWidth: 1.5,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
        });

        chart.subscribeCrosshairMove((param) => {
            if (
                param.point === undefined ||
                !param.time ||
                param.point.x < 0 ||
                param.point.y < 0
            ) {
                setHoverInfo(null);
            } else {
                const candle = param.seriesData.get(candlestickSeriesRef.current!) as any;
                if (candle) {
                    const diff = candle.close - candle.open;
                    const percent = (diff / candle.open) * 100;
                    setHoverInfo({
                        time: moment((param.time as number) * 1000).format('YYYY-MM-DD HH:mm'),
                        open: candle.open,
                        high: candle.high,
                        low: candle.low,
                        close: candle.close,
                        change: diff,
                        changePercent: percent,
                    });
                }
            }
        });

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                });
            }
        };

        window.addEventListener('resize', handleResize);
        chartRef.current = chart;

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    // Update Data
    useEffect(() => {
        if (!data || !candlestickSeriesRef.current || !ma7SeriesRef.current || !ma25SeriesRef.current) return;

        const formattedData: CandlestickData[] = data.kline_data.map((k) => ({
            time: moment(k.time).unix() as any,
            open: k.open,
            high: k.high,
            low: k.low,
            close: k.close,
        }));

        const calculateMA = (days: number): LineData[] => {
            return data.kline_data.map((_, idx, arr) => {
                if (idx < days - 1) return null;
                const slice = arr.slice(idx - days + 1, idx + 1);
                const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
                return {
                    time: moment(arr[idx].time).unix() as any,
                    value: sum / days,
                };
            }).filter(d => d !== null) as LineData[];
        };

        candlestickSeriesRef.current.setData(formattedData);
        ma7SeriesRef.current.setData(calculateMA(7));
        ma25SeriesRef.current.setData(calculateMA(25));

        chartRef.current?.timeScale().fitContent();
    }, [data]);

    return (
        <div className="flex flex-col gap-6">
            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        {symbol.toUpperCase()} / USDT
                        <span className="text-sm font-medium text-slate-400">Kline</span>
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">MA7</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">MA25</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-lg self-start">
                    {INTERVALS.map((item) => (
                        <Button
                            key={item.value}
                            size="sm"
                            variant={interval === item.value ? 'solid' : 'light'}
                            color={interval === item.value ? 'primary' : 'default'}
                            className={`min-w-[48px] h-8 text-xs font-bold transition-all ${
                                interval === item.value 
                                    ? 'shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                            onClick={() => setIntervalValue(item.value)}
                        >
                            {item.label}
                        </Button>
                    ))}
                    <div className="ml-2 px-2 border-l border-slate-200 text-[10px] text-slate-400 font-medium hidden lg:block">
                        1 candle = {INTERVALS.find(i => i.value === interval)?.description}
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="relative w-full h-[600px] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                {/* OHLC Overlay */}
                <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-wrap gap-x-6 gap-y-2 max-w-[80%]">
                    {hoverInfo ? (
                        <>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Time</span>
                                <span className="text-xs font-mono font-bold text-slate-900">{hoverInfo.time}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Open</span>
                                <span className="text-xs font-mono font-bold text-slate-900">${hoverInfo.open.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">High</span>
                                <span className="text-xs font-mono font-bold text-emerald-500">${hoverInfo.high.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Low</span>
                                <span className="text-xs font-mono font-bold text-rose-500">${hoverInfo.low.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Close</span>
                                <span className="text-xs font-mono font-bold text-slate-900">${hoverInfo.close.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Change</span>
                                <span className={`text-xs font-mono font-bold ${hoverInfo.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {hoverInfo.change >= 0 ? '+' : ''}{hoverInfo.change.toFixed(2)} ({hoverInfo.changePercent.toFixed(2)}%)
                                </span>
                            </div>
                        </>
                    ) : data && data.kline_data.length > 0 ? (
                        <div className="text-xs font-bold text-slate-400 italic">
                            Hover over a candle for details
                        </div>
                    ) : null}
                </div>

                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px] z-20">
                        <div className="flex flex-col items-center gap-4">
                            <Spinner size="lg" color="primary" />
                            <span className="text-sm font-bold text-slate-400 animate-pulse">Loading market data...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-rose-50/50 z-20">
                        <div className="flex flex-col items-center gap-3 p-8 bg-white rounded-2xl border border-rose-100 shadow-xl max-w-sm text-center">
                            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{error}</h3>
                            {error === 'Không đủ VIP để xem dữ liệu này' && (
                                <p className="text-sm text-slate-500">Upgrade to VIP to access detailed candlestick history and professional analysis tools.</p>
                            )}
                        </div>
                    </div>
                ) : null}

                {/* The actual chart container */}
                <div 
                    ref={chartContainerRef} 
                    className="flex-1 w-full"
                />
            </div>

            <div className="flex items-center justify-between px-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Real-time Data via Binance Oracle
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        CONNECTED
                    </div>
                    <div>UTC+7</div>
                </div>
            </div>
        </div>
    );
}
