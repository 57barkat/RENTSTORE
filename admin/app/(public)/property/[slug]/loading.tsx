import PublicListingSkeleton from "@/app/components/properties/PublicListingSkeleton";

export default function PropertyDetailLoading() {
  return (
    <PublicListingSkeleton
      title="Loading property details..."
      description="Please wait while we load property details."
    />
  );
}
