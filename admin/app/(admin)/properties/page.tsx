import PropertiesScreen, {
  type PropertyAdminResponse,
} from "@/app/components/admin/PropertiesScreen";
import { requireAdminSession } from "@/app/lib/admin-auth";
import { serverApiRequest } from "@/app/lib/server-api";

export default async function PropertiesPage() {
  const session = await requireAdminSession();
  const response = await serverApiRequest<PropertyAdminResponse>(
    "/properties/admin/list",
    {
      token: session.token,
      searchParams: {
        page: 1,
        limit: 6,
      },
    },
  );

  return <PropertiesScreen initialResponse={response} />;
}
