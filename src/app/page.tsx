import LandingPage from "./(public)/landing_page/LandingPage";
import { fetchInfo } from "@/src/libs/serverFetch";
import AuthProvider from "@/src/provider/AuthProvider";
export const dynamic = 'force-dynamic';

export default async function Home() {
  let basicUserInfor = null;
  try {
    const res = await fetchInfo();
    basicUserInfor = res.data;
  } catch (error) {
    console.error("[app/page.tsx] fetchInfo failed", error);
  }

  return (
    <AuthProvider basicUserInfor={basicUserInfor}>
      <LandingPage />
    </AuthProvider>
  );
}
