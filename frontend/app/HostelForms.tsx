import HostelForm from "@/app/HostelForm";
import React from "react";
import { View, StyleSheet, Alert } from "react-native";
// import { HostelFormProvider } from "@/contextStore/HostelFormContext";
// import HostelForm from "@/app/HostelForm/index";

const HostelForms = () => {
  return (
    <View style={styles.container}>
      <HostelForm />
    </View>
  );
};

export default HostelForms;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // default background; can be themed
  },
});
