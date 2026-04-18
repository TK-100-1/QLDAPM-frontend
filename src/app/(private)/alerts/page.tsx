import Container from "@/src/components/Container";
import { fetchAlerts } from "@/src/libs/serverFetch";
import Alerts from "@/src/views/alert";
import VIPUpgradeGuard from "@/src/components/VIPUpgradeGuard";

export default async function Page() {
  const { triggerList, snoozeList, indicatorList } = await fetchAlerts();
  return (
    <Container className="py-20">
      <VIPUpgradeGuard allowedRoles={["VIP-2", "VIP-3", "Admin"]}>
        <Alerts
          triggerList={triggerList}
          snoozeList={snoozeList}
          indicatorList={indicatorList}
        />
      </VIPUpgradeGuard>
    </Container>
  );
}
