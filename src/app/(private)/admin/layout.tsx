import VIPUpgradeGuard from "@/src/components/VIPUpgradeGuard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin panel for QLDAPM",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-default-50">
      <VIPUpgradeGuard allowedRoles={["Admin"]}>{children}</VIPUpgradeGuard>
    </div>
  );
}
