import MasterLocationScreen from "@/components/UploadPropertyComponents/MasterLocationScreen";

export default function HomeLocation() {
  return (
    <MasterLocationScreen
      nextPath="/upload/PropertyDetails"
      progress={20}
      stepNumber={2}
    />
  );
}
