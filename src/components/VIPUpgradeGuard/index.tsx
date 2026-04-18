"use client";

import React, { ReactNode } from "react";
import { useAuth } from "@/src/provider/AuthProvider";
import { Button } from "@nextui-org/react";
import { LockKey } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

interface VIPUpgradeGuardProps {
  children: ReactNode;
  allowedRoles: string[];
}

export default function VIPUpgradeGuard({
  children,
  allowedRoles,
}: VIPUpgradeGuardProps) {
  const { basicUserInfor } = useAuth();
  const router = useRouter();

  // Mapping role to weights to handle hierarchy (e.g. VIP-2 includes VIP-1)
  const roleWeight: Record<string, number> = {
    "VIP-0": 0,
    "VIP-1": 1,
    "VIP-2": 2,
    "VIP-3": 3,
    Admin: 99,
  };

  const userRole =
    basicUserInfor?.vip_level || (basicUserInfor as any)?.role || "VIP-0";
  const userWeight = roleWeight[userRole] ?? 0;

  let hasAccess = false;
  if (allowedRoles.length === 0) {
    hasAccess = true;
  } else {
    // Check if user matches allowedRoles directly, or is Admin
    if (allowedRoles.includes(userRole) || userRole === "Admin") {
      hasAccess = true;
    } else {
      // Check weight against the minimum required role weight
      const minRequiredWeight = Math.min(
        ...allowedRoles.map((role) => roleWeight[role] || 999),
      );
      if (userWeight >= minRequiredWeight) {
        hasAccess = true;
      }
    }
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center rounded-xl overflow-hidden border border-default-200 dark:border-default-100/20">
      {/* Background blur filter to simulate locked content */}
      <div className="absolute inset-0 z-0 bg-background/5 backdrop-blur-md flex flex-col pointer-events-none p-6">
        <div className="h-4 w-1/3 bg-default-200/50 rounded animate-pulse mb-8" />
        <div className="w-full flex gap-4 mb-4">
          <div className="h-32 w-1/2 bg-default-200/40 rounded-xl animate-pulse" />
          <div className="h-32 w-1/2 bg-default-200/40 rounded-xl animate-pulse" />
        </div>
        <div className="h-64 w-full bg-default-200/30 rounded-xl animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 bg-background/80 dark:bg-default-50/60 backdrop-blur-xl rounded-2xl shadow-large max-w-sm border border-default-200 dark:border-default-100/30">
        <div className="mb-4 bg-primary/10 p-4 rounded-full text-primary">
          <LockKey size={48} weight="duotone" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-foreground">
          Premium Feature Lock
        </h3>
        <p className="text-default-500 mb-6 text-sm">
          You need level <strong>{allowedRoles.join(" or ")}</strong> to access
          this feature. Please upgrade your level to unlock exclusive insights.
        </p>
        <Button
          color="primary"
          variant="shadow"
          radius="full"
          className="w-full font-medium"
          onPress={() => router.push("/user_profile")}
        >
          Upgrade Now
        </Button>
      </div>
    </div>
  );
}
