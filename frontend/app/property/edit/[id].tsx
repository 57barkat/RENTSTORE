import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";
import {
  useFindPropertyByIdQuery,
  useFindPropertyByIdAndUpdateMutation,
} from "@/services/api";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import LocationPicker from "@/utils/LocationPicker";

export const options = { headerShown: false };

// --- Mock upload function ---
const mockUploadImage = async (uri: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return `https://picsum.photos/seed/${Math.random()}/200/200`;
};

// --- Reusable components ---
const FormSection = ({ title, children, theme }: any) => (
  <View style={[styles.section, { backgroundColor: theme.card }]}>
    <Text style={[styles.sectionTitle, { color: theme.secondary }]}>
      {title}
    </Text>
    {children}
  </View>
);

const EditableList = ({
  items,
  setItems,
  placeholder,
  theme,
}: {
  items: string[];
  setItems: (v: string[]) => void;
  placeholder: string;
  theme: any;
}) => {
  const [input, setInput] = useState("");

  const addItem = () => {
    if (input.trim() === "") return;
    setItems([...items, input.trim()]);
    setInput("");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <View>
      <View style={{ flexDirection: "row", marginBottom: 8 }}>
        <TextInput
          style={[
            styles.input,
            { flex: 1, borderColor: theme.border, color: theme.text },
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.muted}
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={addItem}
        >
          <Text style={{ color: "#fff" }}>Add</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {items.map((item, i) => (
          <View
            key={i}
            style={[
              styles.chip,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={{ color: theme.text }}>{item}</Text>
            <TouchableOpacity onPress={() => removeItem(i)}>
              <MaterialCommunityIcons
                name="close-circle"
                size={16}
                color={theme.danger}
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const ImageGallery = ({ images, onAdd, onRemove, theme, isUploading }: any) => {
  const AddButton = () => (
    <TouchableOpacity
      style={[
        styles.addImageButton,
        { borderColor: theme.border, backgroundColor: theme.background },
      ]}
      onPress={onAdd}
      disabled={isUploading}
    >
      {isUploading ? (
        <ActivityIndicator size="small" color={theme.primary} />
      ) : (
        <>
          <MaterialCommunityIcons
            name="image-plus-outline"
            size={28}
            color={theme.primary}
          />
          <Text style={[styles.addImageText, { color: theme.primary }]}>
            Add Image
          </Text>
        </>
      )}
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: string }) => (
    <View style={styles.imageContainer}>
      <Text style={{ display: "none" }}>{item}</Text>
      <TouchableOpacity
        onPress={() => onRemove(item)}
        style={[styles.removeButton, { backgroundColor: theme.danger }]}
      >
        <MaterialCommunityIcons name="close" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={[...images, "ADD_BUTTON"]}
      horizontal
      keyExtractor={(item, i) => item + i}
      renderItem={({ item }) =>
        item === "ADD_BUTTON" ? <AddButton /> : renderItem({ item })
      }
      contentContainerStyle={styles.galleryContent}
    />
  );
};

// --- Main Component ---
export default function EditProperty() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const currentTheme = Colors[theme];

  const { data: property, isLoading } = useFindPropertyByIdQuery(id!, {
    skip: !id,
  });
  const [updateProperty, { isLoading: isUpdating }] =
    useFindPropertyByIdAndUpdateMutation();

  const [form, setForm] = useState<any>({
    title: "",
    monthlyRent: "",
    SecuritybasePrice: "",
    descriptionOverview: "",
    descriptionHighlights: [] as string[],
    city: "",
    streetAddress: "",
    stateTerritory: "",
    country: "",
    zipCode: "",
    aptSuiteUnit: "",
    latitude: "",
    longitude: "",
    guests: "",
    beds: "",
    bathrooms: "",
    amenities: [] as string[],
    ALL_BILLS: [] as string[],
    safetyDetails: [] as string[],
    cameraDescription: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Initialize data
  useEffect(() => {
    if (!property) return;

    const address = property.address?.[0] || {};
    setForm({
      title: property.title || "",
      monthlyRent: property.monthlyRent?.toString() || "",
      SecuritybasePrice: property.SecuritybasePrice?.toString() || "",
      descriptionOverview: property.description?.overview || "",
      descriptionHighlights: property.description?.highlighted || [],
      city: address.city || "",
      streetAddress: address.street || "",
      stateTerritory: address.stateTerritory || "",
      country: address.country || "",
      zipCode: address.zipCode || "",
      aptSuiteUnit: address.aptSuiteUnit || "",
      latitude: property.location?.coordinates?.[1]?.toString() || "",
      longitude: property.location?.coordinates?.[0]?.toString() || "",
      guests: property.capacityState?.guests?.toString() || "",
      beds: property.capacityState?.beds?.toString() || "",
      bathrooms: property.capacityState?.bathrooms?.toString() || "",
      amenities: property.amenities || [],
      ALL_BILLS: property.ALL_BILLS || [],
      safetyDetails: property.safetyDetailsData?.safetyDetails || [],
      cameraDescription: property.safetyDetailsData?.cameraDescription || "",
    });

    setImages(property.photos || []);
  }, [property]);

  const handleChange = (key: string, value: any) =>
    setForm({ ...form, [key]: value });

  const handleAddImage = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Enable gallery permissions to add photos."
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setIsImageUploading(true);
      try {
        const newUrl = await mockUploadImage(uri);
        setImages([...images, newUrl]);
      } catch (e) {
        Alert.alert("Upload failed");
      } finally {
        setIsImageUploading(false);
      }
    }
  };

  const handleRemoveImage = (url: string) =>
    setImages(images.filter((i) => i !== url));

  const handleSave = async () => {
    const dataToSave = {
      title: form.title,
      monthlyRent: parseInt(form.monthlyRent || "0"),
      SecuritybasePrice: parseInt(form.SecuritybasePrice || "0"),
      description: {
        overview: form.descriptionOverview,
        highlighted: form.descriptionHighlights,
      },
      address: [
        {
          street: form.streetAddress,
          city: form.city,
          stateTerritory: form.stateTerritory,
          country: form.country,
          zipCode: form.zipCode,
          aptSuiteUnit: form.aptSuiteUnit,
        },
      ],
      location: {
        type: "Point",
        coordinates: [
          parseFloat(form.longitude || "0"),
          parseFloat(form.latitude || "0"),
        ],
      },
      photos: images,
      capacityState: {
        guests: parseInt(form.guests || "0"),
        beds: parseInt(form.beds || "0"),
        bathrooms: parseInt(form.bathrooms || "0"),
      },
      amenities: form.amenities,
      ALL_BILLS: form.ALL_BILLS,
      safetyDetailsData: {
        safetyDetails: form.safetyDetails,
        cameraDescription: form.cameraDescription,
      },
    };

    try {
      await updateProperty({ id: id!, data: dataToSave }).unwrap();
      Alert.alert("Saved!");
      router.back();
    } catch (e) {
      Alert.alert("Update failed");
    }
  };

  if (isLoading) {
    return (
      <View
        style={[styles.centered, { backgroundColor: currentTheme.background }]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={{ color: currentTheme.muted }}>Loading property...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: currentTheme.background }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={[styles.heading, { color: currentTheme.text }]}>
        Edit Property
      </Text>

      {/* Images */}
      <FormSection title="Property Photos" theme={currentTheme}>
        <ImageGallery
          images={images}
          onAdd={handleAddImage}
          onRemove={handleRemoveImage}
          theme={currentTheme}
          isUploading={isImageUploading}
        />
      </FormSection>

      {/* Basic Info */}
      <FormSection title="Basic Info" theme={currentTheme}>
        <TextInput
          style={[
            styles.input,
            { borderColor: currentTheme.border, color: currentTheme.text },
          ]}
          placeholder="Title"
          placeholderTextColor={currentTheme.muted}
          value={form.title}
          onChangeText={(t) => handleChange("title", t)}
        />
        <TextInput
          style={[
            styles.input,
            { borderColor: currentTheme.border, color: currentTheme.text },
          ]}
          placeholder="Monthly Rent"
          keyboardType="numeric"
          value={form.monthlyRent}
          onChangeText={(t) => handleChange("monthlyRent", t)}
        />
        <TextInput
          style={[
            styles.input,
            { borderColor: currentTheme.border, color: currentTheme.text },
          ]}
          placeholder="Security Deposit"
          keyboardType="numeric"
          value={form.SecuritybasePrice}
          onChangeText={(t) => handleChange("SecuritybasePrice", t)}
        />
        <TextInput
          style={[
            styles.textarea,
            { borderColor: currentTheme.border, color: currentTheme.text },
          ]}
          placeholder="Description Overview"
          multiline
          value={form.descriptionOverview}
          onChangeText={(t) => handleChange("descriptionOverview", t)}
        />
        <EditableList
          items={form.descriptionHighlights}
          setItems={(v) => handleChange("descriptionHighlights", v)}
          placeholder="Add Highlight"
          theme={currentTheme}
        />
      </FormSection>

      {/* Capacity */}
      <FormSection title="Capacity" theme={currentTheme}>
        <TextInput
          style={[
            styles.input,
            { borderColor: currentTheme.border, color: currentTheme.text },
          ]}
          placeholder="Guests"
          keyboardType="numeric"
          value={form.guests}
          onChangeText={(t) => handleChange("guests", t)}
        />
        <TextInput
          style={[
            styles.input,
            { borderColor: currentTheme.border, color: currentTheme.text },
          ]}
          placeholder="Beds"
          keyboardType="numeric"
          value={form.beds}
          onChangeText={(t) => handleChange("beds", t)}
        />
        <TextInput
          style={[
            styles.input,
            { borderColor: currentTheme.border, color: currentTheme.text },
          ]}
          placeholder="Bathrooms"
          keyboardType="numeric"
          value={form.bathrooms}
          onChangeText={(t) => handleChange("bathrooms", t)}
        />
      </FormSection>

      {/* Amenities */}
      <FormSection title="Amenities" theme={currentTheme}>
        <EditableList
          items={form.amenities}
          setItems={(v) => handleChange("amenities", v)}
          placeholder="Add Amenity"
          theme={currentTheme}
        />
      </FormSection>

      {/* Bills */}
      <FormSection title="Included Bills" theme={currentTheme}>
        <EditableList
          items={form.ALL_BILLS}
          setItems={(v) => handleChange("ALL_BILLS", v)}
          placeholder="Add Bill"
          theme={currentTheme}
        />
      </FormSection>

      {/* Safety */}
      <FormSection title="Safety & Security" theme={currentTheme}>
        <EditableList
          items={form.safetyDetails}
          setItems={(v) => handleChange("safetyDetails", v)}
          placeholder="Add Safety Feature"
          theme={currentTheme}
        />
        <TextInput
          style={[
            styles.input,
            { borderColor: currentTheme.border, color: currentTheme.text },
          ]}
          placeholder="Camera Description"
          value={form.cameraDescription}
          onChangeText={(t) => handleChange("cameraDescription", t)}
        />
      </FormSection>

      {/* Address */}
      <FormSection title="Full Address" theme={currentTheme}>
        <TextInput
          style={[
            styles.input,
            { borderColor: currentTheme.border, color: currentTheme.text },
          ]}
          placeholder="Street"
          value={form.streetAddress}
          onChangeText={(t) => handleChange("streetAddress", t)}
        />
        <TextInput
          style={[
            styles.input,
            { borderColor: currentTheme.border, color: currentTheme.text },
          ]}
          placeholder="City"
          value={form.city}
          onChangeText={(t) => handleChange("city", t)}
        />
        <TextInput
          style={[
            styles.input,
            { borderColor: currentTheme.border, color: currentTheme.text },
          ]}
          placeholder="State / Territory"
          value={form.stateTerritory}
          onChangeText={(t) => handleChange("stateTerritory", t)}
        />
        <TextInput
          style={[
            styles.input,
            { borderColor: currentTheme.border, color: currentTheme.text },
          ]}
          placeholder="Country"
          value={form.country}
          onChangeText={(t) => handleChange("country", t)}
        />
        <TextInput
          style={[
            styles.input,
            { borderColor: currentTheme.border, color: currentTheme.text },
          ]}
          placeholder="Zip Code"
          value={form.zipCode}
          onChangeText={(t) => handleChange("zipCode", t)}
        />
        <TextInput
          style={[
            styles.input,
            { borderColor: currentTheme.border, color: currentTheme.text },
          ]}
          placeholder="Apt / Suite"
          value={form.aptSuiteUnit}
          onChangeText={(t) => handleChange("aptSuiteUnit", t)}
        />
        <LocationPicker
          onPick={(lat, lng, address) => {
            handleChange("latitude", lat.toString());
            handleChange("longitude", lng.toString());
            if (address) handleChange("streetAddress", address);
          }}
        />
      </FormSection>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: currentTheme.primary }]}
        onPress={handleSave}
        disabled={isUpdating || isImageUploading}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          {isUpdating || isImageUploading ? "Saving..." : "Save Changes"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  heading: { fontSize: 28, fontWeight: "700", marginBottom: 16 },
  section: { padding: 16, borderRadius: 12, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 },
  textarea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: "top",
  },
  addButton: {
    paddingHorizontal: 12,
    justifyContent: "center",
    marginLeft: 8,
    borderRadius: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderWidth: 1,
    borderRadius: 16,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  galleryContent: { paddingRight: 10 },
  imageContainer: {
    width: 150,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 10,
    position: "relative",
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageButton: {
    width: 150,
    height: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    padding: 10,
  },
  addImageText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
