export type CoinData = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: {
    times: number;
    currency: string;
    percentage: number;
  } | null;
  last_updated: string;
};

export type CoinDetailData = {
  id: string;
  symbol: string;
  name: string;
  hashing_algorithm: string;
  categories: string[];
  description: {
    en: string;
  };
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  market_data: {
    market_cap_rank: number;
    current_price: {
      usd: number;
    };
    market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    fully_diluted_valuation: {
      usd: number;
    };
    high_24h: {
      usd: number;
    };
    low_24h: {
      usd: number;
    };
    price_change_24h: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_14d: number;
    price_change_percentage_30d: number;
    price_change_percentage_60d: number;
    price_change_percentage_200d: number;
    price_change_percentage_1y: number;
    market_cap_change_24h: number;
    market_cap_change_percentage_24h: number;
    total_supply: number;
    max_supply: number;
    circulating_supply: number;
  };
};

export type CoinHistoryData = {
  // [timestamp, price]
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
};

export type SpotPriceData = {
  symbol: string; // Example: "BTCUSDT"
  price: string; // Example: "10000.00"
  eventTime: string; // Example: "2024-10-18 22:21:00"
};

export type MarketCapData = {
  marketdata: {
    "market-cap": {
      usd: number; // Example: 1000000000
    };
    total_volume: {
      usd: number; // Example: 1000000000
    };
  };
};

export type FuturePriceData = {
  symbol: string; // Example: "BTCUSDT"
  price: string; // Example: "10000.00"
  eventTime: string; // Example: "2024-10-18 22:21:00"
};

export type FundingRateData = {
  adjustedFundingRateCap: string;
  adjustedFundingRateFloor: string;
  eventTime: string;
  fundingCountDown: string;
  fundingIntervalHours: number;
  fundingRate: string;
};

export type KlineEntry = {
  time: string; // RFC3339 formatted timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type KlineData = {
  symbol: string; // Example: "BTCUSDT"
  interval: string; // Example: "1m"
  eventTime: string; // Example: "2024-10-18 22:21:00"
  kline_data: KlineEntry[]; // Array of candles, latest is last
};
