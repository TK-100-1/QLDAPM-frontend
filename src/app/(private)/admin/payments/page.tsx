import { fetchPaymentHistory } from "@/src/libs/serverFetch/adminFetch";
import PaymentsView from "@/src/views/admin/PaymentsView";

export default async function AdminPaymentsPage() {
  const paymentRes = await fetchPaymentHistory();

  return <PaymentsView payments={paymentRes.data || []} />;
}
