"use client";

import Form from "@/src/components/Form";
import Logo from "@/src/components/Logo";
import { Input, Select, SelectItem } from "@nextui-org/react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import ContinueButton from "../components/ContinueButton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signin } from "@/src/libs/serverAction/auth";


interface LoginFormData {
  identifier: string;
  password: string;
}
export default function SignInForm() {
  const router = useRouter();

  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    identifier: "",
    password: "",
  });
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");


  const handleSignIn = async () => {
    setError("");
    const res = await signin(
      loginFormData.identifier,
      loginFormData.password
    );
    console.log("[handleSignIn] result:", res);
    if (res.success) {
      toast.success(res.message);
      router.refresh();
      router.push("/market");
    } else {
      setError(res.message);
      toast.error(res.message);
    }
  };
  return (
    <Form className="w-[24rem] sm:w-[28rem] bg-white shadow-lg p-8 rounded-lg">
      <Logo className="w-52 h-[72px]" />

      <h1 className="text-4xl font-bold">Sign In</h1>

      <div className="w-full">
        <Input
          radius="sm"
          label="Email or Username"
          type="text"
          isRequired
          value={loginFormData.identifier}
          onChange={(e) =>
            setLoginFormData({ ...loginFormData, identifier: e.target.value })
          }
        />
      </div>

      <Input
        radius="sm"
        label="Password"
        type={isShowPassword ? "text" : "password"}
        isRequired
        isInvalid={!!error}
        errorMessage={error}
        value={loginFormData.password}
        endContent={
          <button
            className="focus:outline-none"
            type="button"
            onClick={() => setIsShowPassword(!isShowPassword)}
            aria-label="toggle password visibility">
            {isShowPassword ? (
              <EyeSlash className="text-2xl text-default-400 pointer-events-none" />
            ) : (
              <Eye className="text-2xl text-default-400 pointer-events-none" />
            )}
          </button>
        }
        onChange={(e) =>
          setLoginFormData({ ...loginFormData, password: e.target.value })
        }
      />

      <div className="w-full">
        <Link
          href="/forgot_password"
          className="text-md text-blue-400 hover:underline hover:underline-offset-2">
          Forgot password?
        </Link>
      </div>

      <ContinueButton onClick={handleSignIn} />

      <div className="w-full flex gap-2 items-center justify-center">
        <span>{"Don't have an account?"}</span>
        <Link href="/signup" className="text-blue-400 hover:underline">
          Get started now
        </Link>
      </div>
    </Form>
  );
}
