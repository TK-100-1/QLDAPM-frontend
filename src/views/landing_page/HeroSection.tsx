"use client";

import Image from "next/image";
import Component3 from "@/public/landingpage/Component 3.svg";
import Component1 from "@/public/landingpage/Component 1.svg";
import Component2 from "@/public/landingpage/Component 2.svg";
import { Button } from "@nextui-org/react";
import Link from "next/link";

export default function HeroSection() {
  return (
    // Thêm flex flex-col và items-center để mọi thứ xếp hàng dọc ngay ngắn
    <div className="flex flex-col items-center text-center gap-10">
      {/* Phần Tiêu đề với Vòng sáng */}
      <div className="relative flex items-center justify-center pt-20">
        {/* Vòng sáng nằm dưới cùng */}
        <div className="absolute w-[40rem] h-60 bg-[#6EC3FB] bg-opacity-30 blur-3xl -z-10" />

        {/* Tiêu đề chính - Bỏ absolute ở đây để nó giữ chỗ trong layout */}
        <h1 className="flex flex-col font-bold text-8xl leading-tight">
          <span>Coin Price</span>
          <span>Web Page</span>
        </h1>
      </div>

      {/* Các thành phần còn lại tự động xếp hàng bên dưới */}
      <span className="text-lg">
        Connect you to the latest finance information!
      </span>

      <Button
        as={Link}
        href="/signup"
        size="lg"
        radius="lg"
        className="text-2xl font-bold bg-[#0094FF] text-white p-6 h-auto"
      >
        Get started for free
      </Button>

      <h2 className="text-5xl font-bold mt-10">For your experience</h2>

      {/* Phần Features */}
      <div className="flex flex-wrap justify-center gap-20 w-full mt-10">
        <div className="flex flex-col items-center justify-between h-48 w-44">
          <Image src={Component1} alt="Component 1" />
          <span className="text-xl font-bold">
            Read-only access to your data
          </span>
        </div>
        <div className="flex flex-col items-center justify-between h-48 w-60">
          <Image src={Component2} alt="Component 2" />
          <span className="text-xl font-bold">
            End-to-end encryption and token-based API
          </span>
        </div>
        <div className="flex flex-col items-center justify-between h-48 w-44">
          <Image src={Component3} alt="Component 3" />
          <span className="text-xl font-bold">Certified User Security</span>
        </div>
      </div>
    </div>
  );
}
