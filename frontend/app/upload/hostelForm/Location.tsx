import MasterLocationScreen from "@/components/UploadPropertyComponents/MasterLocationScreen";

export default function HostelLocation() {
  return (
    <MasterLocationScreen
      propertyTypeLabel="Hostel"
      nextPath="upload/hostelForm/PropertyDetails"
      progress={20}
      stepNumber={2}
    />
  );
}
