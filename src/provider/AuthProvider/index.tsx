"use client";
import { BasicUserInfo } from "@/src/types/user";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect } from "react";

interface AuthContextType {
  basicUserInfor: BasicUserInfo;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface Props {
  children: ReactNode;
  basicUserInfor: BasicUserInfo | null;
}

export default function AuthProvider({ children, basicUserInfor }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (basicUserInfor == null) {
      router.push("/signin");
    }
  }, [basicUserInfor, router]);

  if (basicUserInfor == null) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ basicUserInfor }}>
      {children}
    </AuthContext.Provider>
  );
}
