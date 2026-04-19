import { fetchAllUsers } from "@/src/libs/serverFetch/adminFetch";
import UsersView from "@/src/views/admin/UsersView";

export default async function AdminUsersPage() {
  const usersRes = await fetchAllUsers();

  return <UsersView initialUsers={usersRes.data || []} />;
}
