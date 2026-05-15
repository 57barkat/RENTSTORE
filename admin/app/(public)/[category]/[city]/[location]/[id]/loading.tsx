import PublicListingSkeleton from "@/app/components/properties/PublicListingSkeleton";

export default function LegacyPropertyDetailLoading() {
  return (
    <PublicListingSkeleton
      title="Loading property details..."
      description="Please wait while we load property details."
    />
  );
}
