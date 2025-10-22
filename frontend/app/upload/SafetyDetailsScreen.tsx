import React, { FC, useState, useCallback, useContext, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import StepContainer from "@/app/upload/Welcome";
import { router } from "expo-router";
import { styles } from "@/styles/SafetyDetailsScreen";
import { SAFETY_DETAILS } from "@/utils/SafetyDetails";
import { CheckboxItem } from "@/components/UploadPropertyComponents/SafetyDetailsCheckboxItem";
import { CameraModal } from "@/components/UploadPropertyComponents/CameraModal";
import { FormContext, FormContextType } from "@/contextStore/FormContext";

export interface SafetyDetailsData {
  safetyDetails: string[];
  cameraDescription: string | null;
}

const SafetyDetailsScreen: FC = () => {
  const formContext = useContext(FormContext);
  if (!formContext) {
    throw new Error("SafetyDetailsScreen must be used within a FormProvider");
  }

  const { data, updateForm } = formContext as FormContextType;

  // ✅ Initialize state safely from persisted context
  const [checkedDetails, setCheckedDetails] = useState<Set<string>>(
    new Set(data.safetyDetailsData?.safetyDetails ?? [])
  );
  const [cameraDescription, setCameraDescription] = useState(
    data.safetyDetailsData?.cameraDescription ?? ""
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  // ✅ Re-sync when context data changes (e.g. when restored from AsyncStorage)
  useEffect(() => {
    if (data.safetyDetailsData) {
      setCheckedDetails(new Set(data.safetyDetailsData.safetyDetails ?? []));
      setCameraDescription(data.safetyDetailsData.cameraDescription ?? "");
    }
  }, [data.safetyDetailsData]);

  const handleToggleDetail = useCallback(
    (key: string) => {
      const isChecked = checkedDetails.has(key);

      if (key === "exterior_camera") {
        if (!isChecked) {
          setIsModalVisible(true);
        } else {
          setCheckedDetails((prev) => {
            const newSet = new Set(prev);
            newSet.delete(key);
            return newSet;
          });
          setCameraDescription("");
        }
      } else {
        setCheckedDetails((prev) => {
          const newSet = new Set(prev);
          if (isChecked) newSet.delete(key);
          else newSet.add(key);
          return newSet;
        });
      }
    },
    [checkedDetails]
  );

  const handleModalContinue = useCallback((description: string) => {
    setCameraDescription(description);
    setIsModalVisible(false);
    if (description.length > 0) {
      setCheckedDetails((prev) => new Set(prev).add("exterior_camera"));
    }
  }, []);

  const handleModalClose = useCallback(() => setIsModalVisible(false), []);

  const handleNext = () => {
    const detailsArray = Array.from(checkedDetails);
    const finalData: SafetyDetailsData = {
      safetyDetails: detailsArray,
      cameraDescription: detailsArray.includes("exterior_camera")
        ? cameraDescription
        : null,
    };

    // ✅ Save to context (and persist via AsyncStorage)
    updateForm("safetyDetailsData", finalData);

    router.push("/upload/FinalAddressDetailsScreen");
  };

  return (
    <StepContainer
      title="Share safety details"
      onNext={handleNext}
      isNextDisabled={false}
      progress={96}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.sectionTitle}>
          Does your place have any of these?
        </Text>

        {SAFETY_DETAILS.map((detail) => (
          <CheckboxItem
            key={detail.key}
            detail={detail}
            isChecked={checkedDetails.has(detail.key)}
            onToggle={handleToggleDetail}
            description={
              detail.key === "exterior_camera" ? cameraDescription : undefined
            }
            onEditDescription={
              detail.key === "exterior_camera"
                ? () => setIsModalVisible(true)
                : undefined
            }
          />
        ))}

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Important things to know</Text>
        <Text style={styles.infoText}>
          Security cameras that monitor indoor spaces are not allowed even if
          they’re turned off. All exterior security cameras must be disclosed.
        </Text>
      </ScrollView>

      <CameraModal
        visible={isModalVisible}
        initialDescription={cameraDescription}
        onContinue={handleModalContinue}
        onClose={handleModalClose}
      />
    </StepContainer>
  );
};

export default SafetyDetailsScreen;
