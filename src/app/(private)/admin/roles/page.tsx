import { fetchRoles } from "@/src/libs/serverFetch/adminFetch";
import RolesView from "@/src/views/admin/RolesView";

export default async function AdminRolesPage() {
  const rolesRes = await fetchRoles();

  return <RolesView initialRoles={rolesRes.data || []} />;
}
