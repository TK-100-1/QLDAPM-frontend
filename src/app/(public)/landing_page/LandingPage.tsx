"use client";

import Container from "@/src/components/Container";
import Footer from "@/src/layouts/public_page/Footer";
import Navbar from "@/src/layouts/public_page/Navbar";
import PrivateNavbar from "@/src/layouts/private_page/Navbar";
import HeroSection from "@/src/views/landing_page/HeroSection";
import { useAuth } from "@/src/provider/AuthProvider";

export default function LandingPage() {
  const { basicUserInfor } = useAuth();

  return (
    <Container className="bg-[#DCF0FF] gap-12">
      {basicUserInfor ? <PrivateNavbar /> : <Navbar />}
      <div className="pt-[10px]">
        <HeroSection />
      </div>
      <Footer />
    </Container>
  );
}
