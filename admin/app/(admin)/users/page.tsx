import UsersScreen, {
  type UsersResponse,
} from "@/app/components/admin/UsersScreen";
import { requireAdminSession } from "@/app/lib/admin-auth";
import { serverApiRequest } from "@/app/lib/server-api";

export default async function UsersPage() {
  const session = await requireAdminSession();
  const response = await serverApiRequest<UsersResponse>("/users/admin/all", {
    token: session.token,
    searchParams: {
      page: 1,
      limit: 10,
      search: "",
    },
  });

  return (
    <UsersScreen
      initialUsers={response.data}
      initialTotalPages={response.totalPages}
    />
  );
}
