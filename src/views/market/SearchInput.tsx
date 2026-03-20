"use client";

import { Input } from "@nextui-org/react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "@/src/libs/hooks/useDebounce";

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [value, setValue] = useState(initialQuery);
  const debouncedValue = useDebounce<string>(value, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedValue) {
      params.set("q", debouncedValue);
      params.delete("page"); // Reset to page 1 on new search
    } else {
      params.delete("q");
    }
    
    // Only push if the query actually changed to avoid redundant navigation
    if (params.get("q") !== searchParams.get("q")) {
      router.push(`/market?${params.toString()}`);
    }
  }, [debouncedValue, router, searchParams]);

  return (
    <div className="w-full max-w-md mb-8">
      <Input
        value={value}
        onValueChange={setValue}
        placeholder="Search for a coin (e.g. Bitcoin, ETH...)"
        radius="lg"
        size="lg"
        variant="bordered"
        startContent={<MagnifyingGlass size={20} className="text-slate-400" />}
        endContent={
          value && (
            <button onClick={() => setValue("")} className="focus:outline-none">
              <X size={18} className="text-slate-400 hover:text-slate-600" />
            </button>
          )
        }
        classNames={{
          inputWrapper: "border-slate-200 hover:border-blue-400 focus-within:!border-blue-500 bg-white shadow-sm",
        }}
      />
    </div>
  );
}
