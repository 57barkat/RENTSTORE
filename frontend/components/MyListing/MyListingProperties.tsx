import React, { useCallback, useState } from "react";
import {
  FlatList,
  View,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  Modal,
  TouchableOpacity,
  Text,
  RefreshControl,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { router, useFocusEffect } from "expo-router";
import Toast from "react-native-toast-message";
import { useMyPropertiesLogic } from "@/hooks/useMyPropertiesLogic";
import { useAuth } from "@/contextStore/AuthContext";
import { usePromotePropertyMutation } from "@/services/api";
import { FontSize } from "@/constants/Typography";
import { Colors } from "@/constants/Colors";
import ListHeader from "./ListHeader";
import PropertyCard from "./PropertyCard";
import PromoteConfirmationModal from "./PromoteConfirmationModal";

const MyListingProperties = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const { width } = useWindowDimensions();
  const logic = useMyPropertiesLogic();
  const { user, updateUser } = useAuth();
  const [promoteModalVisible, setPromoteModalVisible] = useState(false);
  const [targetProperty, setTargetProperty] = useState<any>(null);
  const [promoteProperty, { isLoading: isPromoting }] =
    usePromotePropertyMutation();

  useFocusEffect(
    useCallback(() => {
      logic.onRefresh();
    }, []),
  );

  const handlePromote = async (id: string, type: "boost" | "featured") => {
    try {
      const response = await promoteProperty({ id, type }).unwrap();
      if (response.user) await updateUser(response.user);
      Toast.show({
        type: "success",
        text1: type === "boost" ? "Property Boosted" : "Property Featured",
      });
      logic.onRefresh();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed",
        text2: err.data?.message || "Something went wrong",
      });
    }
  };

  const handleOpenPromoteModal = (property: any) => {
    setTargetProperty(property);
    setPromoteModalVisible(true);
  };

  const handleConfirmPromote = async (type: "boost" | "featured") => {
    if (!targetProperty) return;
    await handlePromote(targetProperty._id, type);
    setPromoteModalVisible(false);
  };

  if (logic.isLoading && logic.page === 1) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <ActivityIndicator size="large" color={currentTheme.secondary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <FlatList
        data={logic.properties}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        onEndReached={logic.loadMore}
        refreshControl={
          <RefreshControl
            refreshing={logic.refreshing}
            onRefresh={logic.onRefresh}
            tintColor={currentTheme.secondary}
          />
        }
        ListHeaderComponent={
          <ListHeader
            currentTheme={currentTheme}
            search={logic.search}
            setSearch={logic.setSearch}
            sort={logic.sort}
            setSort={logic.setSort}
            user={user}
          />
        }
        renderItem={({ item }) => {
          const handleEdit = () => {
            logic.formContext?.setFullFormData(item);
            const routes: Record<string, string> = {
              home: "/upload/PropertyDetails",
              apartment: "/upload/apartmentForm/PropertyDetails",
              hostel: "/upload/hostelForm/PropertyDetails",
            };
            const targetRoute =
              routes[item.hostOption] || "/upload/PropertyDetails";
            router.push(targetRoute);
          };

          return (
            <PropertyCard
              item={item}
              currentTheme={currentTheme}
              width={width}
              isPromoting={isPromoting}
              onView={() => router.push(`/property/${item._id}`)}
              onEdit={handleEdit}
              onDelete={() => {
                logic.setSelectedPropertyId(item._id);
                logic.setDeleteModalVisible(true);
              }}
              onPromote={() => handleOpenPromoteModal(item)}
            />
          );
        }}
        ListFooterComponent={
          logic.isFetching && logic.page > 1 ? (
            <ActivityIndicator style={{ marginVertical: 20 }} />
          ) : (
            <View style={{ height: 40 }} />
          )
        }
      />
      <PromoteConfirmationModal
        visible={promoteModalVisible}
        onClose={() => setPromoteModalVisible(false)}
        onConfirm={handleConfirmPromote}
        propertyTitle={targetProperty?.title || ""}
        featuredCredits={user?.paidFeaturedCredits || 0}
        boostCredits={user?.prioritySlotCredits || 0}
        isPromoting={isPromoting}
        currentTheme={currentTheme}
      />
      <Modal
        visible={logic.deleteModalVisible}
        transparent
        animationType="fade"
      >
        <View style={modalStyles.overlay}>
          <View
            style={[modalStyles.box, { backgroundColor: currentTheme.card }]}
          >
            <Text style={[modalStyles.title, { color: currentTheme.text }]}>
              Delete Property?
            </Text>
            <Text
              style={[modalStyles.message, { color: currentTheme.secondary }]}
            >
              Are you sure you want to delete this listing?
            </Text>
            <View style={modalStyles.buttons}>
              <TouchableOpacity
                onPress={() => logic.setDeleteModalVisible(false)}
                style={modalStyles.cancelBtn}
              >
                <Text style={modalStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={logic.handleDelete}
                style={[
                  modalStyles.deleteBtn,
                  { backgroundColor: currentTheme.danger },
                ]}
              >
                <Text style={modalStyles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: { width: "85%", borderRadius: 20, padding: 22 },
  title: { fontSize: FontSize.base, fontWeight: "800", marginBottom: 10 },
  message: { fontSize: FontSize.sm, marginBottom: 20 },
  buttons: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 18 },
  cancelText: { fontSize: FontSize.sm, color: "#777" },
  deleteBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10 },
  deleteText: { color: "#fff", fontWeight: "700", fontSize: FontSize.sm },
});

export default MyListingProperties;
