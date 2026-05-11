import Container from "@/src/components/Container";
import { fetchAlerts } from "@/src/libs/serverFetch";
import Alerts from "@/src/views/alert";

export default async function AdminAlertsPage() {
  const { triggerList, snoozeList, indicatorList } = await fetchAlerts();
  return (
    <Container className="py-20">
      <Alerts
        triggerList={triggerList}
        snoozeList={snoozeList}
        indicatorList={indicatorList}
      />
    </Container>
  );
}
