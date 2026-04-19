import {
  fetchAllUsers,
  fetchPaymentHistory,
} from "@/src/libs/serverFetch/adminFetch";
import DashboardView from "@/src/views/admin/DashboardView";

export default async function AdminDashboardPage() {
  const usersRes = await fetchAllUsers();
  const paymentRes = await fetchPaymentHistory();

  return (
    <DashboardView
      users={usersRes.data || []}
      payments={paymentRes.data || []}
    />
  );
}
