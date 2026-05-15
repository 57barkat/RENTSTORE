import { Suspense } from "react";

import PublicListingLoadingShell from "@/app/components/properties/PublicListingLoadingShell";

export default function PublicLoading() {
  return (
    <Suspense fallback={null}>
      <PublicListingLoadingShell />
    </Suspense>
  );
}
