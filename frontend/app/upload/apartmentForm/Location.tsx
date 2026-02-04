import MasterLocationScreen from "@/components/UploadPropertyComponents/MasterLocationScreen";

export default function ApartmentLocation() {
  return (
    <MasterLocationScreen
      propertyTypeLabel="Apartment"
      nextPath="/upload/apartmentForm/PropertyDetails"
      progress={20}
    />
  );
}
