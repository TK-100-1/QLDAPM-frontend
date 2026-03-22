import FlexBox from "@/src/components/Box/FlexBox";
import Container from "@/src/components/Container";
import { H1 } from "@/src/components/Heading";
import { fetchCoinList, searchCoins } from "@/src/libs/serverFetch";
import CoinList from "@/src/views/market/CoinList";
import MarketPagnitation from "@/src/views/market/Pagnitation";
import SearchInput from "@/src/views/market/SearchInput";

interface CoinParams {
  page: string;
  q: string;
}

interface Props {
  searchParams: CoinParams;
}

export default async function Page({ searchParams }: Props) {
  const page = parseInt(searchParams.page) || 1;
  const query = searchParams.q || "";

  console.log("[market/page] rendering, page:", page, "query:", query);

  const fetchRes = query 
    ? await searchCoins(query)
    : await fetchCoinList("usd", page);

  console.log(
    "[market/page] fetch result — success:", 
    fetchRes.success, 
    "count:", 
    fetchRes.data?.length ?? "null"
  );
  
  const coinList = fetchRes.data ?? [];

  return (
    <Container className="py-20">
      <FlexBox className="w-10/12 pt-20 pb-4 flex-col">
        <H1 className="text-4xl">Cryptocurrency Market</H1>
        <span className="text-md text-gray-500 max-w-2xl mt-2 mb-8">
          Search and explore the dynamic world of digital assets. Monitor real-time prices, 
          market trends, and detailed insights from across the global cryptocurrency ecosystem.
        </span>
        
        <SearchInput />
      </FlexBox>

      <FlexBox className="w-10/12 flex-col gap-4 items-center">
        <CoinList coinList={coinList} />
        {!query && <MarketPagnitation />}
      </FlexBox>
    </Container>
  );
}
