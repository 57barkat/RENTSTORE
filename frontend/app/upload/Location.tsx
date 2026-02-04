import MasterLocationScreen from "@/components/UploadPropertyComponents/MasterLocationScreen";

export default function HomeLocation() {
  return (
    <MasterLocationScreen
      propertyTypeLabel="Home"
      nextPath="/upload/PropertyDetails"
      progress={20}
    />
  );
}
