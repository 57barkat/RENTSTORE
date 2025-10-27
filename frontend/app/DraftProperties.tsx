import React, { useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";
import { useRouter } from "expo-router";
import { FormContext } from "@/contextStore/FormContext";
import { useGetDraftPropertiesQuery } from "@/services/api";

export default function DraftProperties() {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const router = useRouter();
  const formContext = useContext(FormContext);

  // Fetch data
  const { data, isLoading, isError, refetch } =
    useGetDraftPropertiesQuery(undefined);


  useEffect(() => {
    refetch();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={{ color: currentTheme.text }}>Loading drafts...</Text>
      </View>
    );
  }

  if (isError || !data?.length) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: currentTheme.text }}>
          No draft properties found.
        </Text>
      </View>
    );
  }

  const handleResumeDraft = (draft: any) => {
    formContext?.setFullFormData(draft);
    router.push("/upload/IntroStep1");
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: currentTheme.card }]}
      onPress={() => handleResumeDraft(item)}
    >
      <Image
        source={{ uri: item.photos?.[0] }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={[styles.title, { color: currentTheme.text }]}>
          {item.title || "Untitled Property"}
        </Text>
        <Text style={[styles.subText]}>{item.location || "No location"}</Text>
        <Text style={[styles.price, { color: currentTheme.primary }]}>
          ${item.monthlyRent}/month
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <Text style={[styles.header, { color: currentTheme.text }]}>
        Your Drafts
      </Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: "600", marginBottom: 12 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 3,
  },
  image: { width: "100%", height: 160 },
  info: { padding: 10 },
  title: { fontSize: 18, fontWeight: "600" },
  subText: { fontSize: 14, marginVertical: 2 },
  price: { fontSize: 16, fontWeight: "700", marginTop: 4 },
});
