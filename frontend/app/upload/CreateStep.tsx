import React, { FC } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { styles } from "@/styles/CreateStep";
import { OptionCard } from "@/components/UploadPropertyComponents/OptionCard";

const NEW_LISTING_PATH = "/upload/Location";

const CreateStep: FC = () => {
  const router = useRouter();

  const handleCreateNew = () => {
    router.push(NEW_LISTING_PATH as `${string}:param`);
  };

  const handleCreateFromExisting = () => {
    console.log("Navigating to existing listings selection.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Start a new listing</Text>

      <OptionCard
        iconName="home-plus-outline"
        title="Create a new listing"
        onPress={handleCreateNew}
      />
      <View style={styles.separator} />
      <OptionCard
        iconName="content-copy"
        title="Create from an existing listing"
        onPress={handleCreateFromExisting}
      />
    </View>
  );
};

export default CreateStep;
