import { fetchAllUsers, fetchRoles } from "@/src/libs/serverFetch/adminFetch";
import UsersView from "@/src/views/admin/UsersView";

export default async function AdminUsersPage() {
  const usersRes = await fetchAllUsers();
  const rolesRes = await fetchRoles();

  return <UsersView initialUsers={usersRes.data || []} roles={rolesRes.data || []} />;
}
