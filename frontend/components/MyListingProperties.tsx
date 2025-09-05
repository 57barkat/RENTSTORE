import { useFindMyPropertiesQuery } from "@/services/api";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import ImageCarousel from "@/utils/Carousel";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";
import MapView, { Marker } from "react-native-maps";

const MyListingProperties = () => {
  const { data: myProperties, isLoading, error } = useFindMyPropertiesQuery();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const { width } = useWindowDimensions();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={{ marginTop: 8, color: currentTheme.text }}>
          Loading properties...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>Failed to load properties.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, padding: 8, backgroundColor: currentTheme.background }}
      data={myProperties ?? []}
      keyExtractor={(item, index) => item._id ?? index.toString()}
      ListHeaderComponent={
        <View>
          <Text style={[styles.header, { color: currentTheme.text }]}>
            My Listing Properties
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View
          style={[
            styles.card,
            { backgroundColor: currentTheme.card, width: width * 0.95 },
          ]}
        >
          <ImageCarousel
            images={
              item.images && item.images.length > 0
                ? item.images.map((img: string) => ({ uri: img }))
                : []
            }
          />

          <Text style={[styles.title, { color: currentTheme.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.location, { color: currentTheme.muted }]}>
            📍 {item.city} | {item.address}
          </Text>

          {/* Location Map Label */}
          {item.latitude && item.longitude && (
            <Text style={[styles.mapLabel, { color: currentTheme.muted }]}>
              Location
            </Text>
          )}

          {/* Improved Map UI */}
          {item.latitude && item.longitude && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: Number(item.latitude),
                  longitude: Number(item.longitude),
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pointerEvents="none"
              >
                <Marker
                  coordinate={{
                    latitude: Number(item.latitude),
                    longitude: Number(item.longitude),
                  }}
                  title={item.title}
                  description={item.address}
                />
              </MapView>
            </View>
          )}

          {/* Property Info */}
          <Text style={[styles.title, { color: currentTheme.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.location, { color: currentTheme.muted }]}>
            📍 {item.city} | {item.address}
          </Text>
          <Text style={[styles.price, { color: currentTheme.primary }]}>
            💰 Rs. {item.rentPrice.toLocaleString()}
          </Text>
          <Text style={[styles.details, { color: currentTheme.muted }]}>
            {item.propertyType} • {item.bathrooms ?? "N/A"} Bath • {item.kitchens ?? "N/A"} Kitchen • {item.livingRooms ?? "N/A"} Living Rooms
          </Text>
          <Text style={[styles.details, { color: currentTheme.muted }]}>
            Area: {item.area ?? "N/A"} sq.ft
          </Text>
          <Text style={[styles.details, { color: currentTheme.muted }]}>
            Bedrooms: {item.bedrooms ?? "N/A"} • Balconies: {item.balconies ?? "N/A"}
          </Text>
          <Text style={[styles.details, { color: currentTheme.muted }]}>
            Furnished: {item.furnished ? "Yes" : "No"} • Floor: {item.floor ?? "N/A"}
          </Text>
          <Text style={[styles.details, { color: currentTheme.muted }]}>
            Latitude: {item.latitude ?? "N/A"} • Longitude: {item.longitude ?? "N/A"}
          </Text>
          <Text style={[styles.details, { color: currentTheme.muted }]}>
            Security Deposit: Rs. {item.securityDeposit?.toLocaleString() ?? "N/A"}
          </Text>
          <Text style={[styles.details, { color: currentTheme.muted }]}>
            Maintenance Charges: Rs. {item.maintenanceCharges?.toLocaleString() ?? "N/A"}
          </Text>
          <Text style={[styles.details, { color: currentTheme.muted }]}>
            Utilities Included: {item.utilitiesIncluded ? "Yes" : "No"}
          </Text>
          <Text style={[styles.details, { color: currentTheme.muted }]}>
            Amenities: {item.amenities && item.amenities.length > 0 ? item.amenities.join(", ") : "N/A"}
          </Text>
          <Text style={[styles.details, { color: currentTheme.muted }]}>
            Preferences: {item.preferences && item.preferences.length > 0 ? item.preferences.join(", ") : "N/A"}
          </Text>
          <Text style={[styles.details, { color: currentTheme.muted }]}>
            Created At: {item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}
          </Text>
          <Text style={[styles.details, { color: currentTheme.muted }]}>
            Updated At: {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "N/A"}
          </Text>
        </View>
      )}
      contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
    // backgroundColor set dynamically
    padding: 14,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    // width set dynamically
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    // color set dynamically
  },
  location: {
    // color set dynamically
    marginBottom: 2,
  },
  price: {
    // color set dynamically
    fontWeight: "500",
  },
  details: {
    // color set dynamically
    marginTop: 4,
  },
  mapContainer: {
    height: 120,
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    backgroundColor: "#f8f8f8",
  },
  map: {
    flex: 1,
  },
  mapLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 6,
    marginBottom: 2,
    marginLeft: 2,
  },
});

export default MyListingProperties;
