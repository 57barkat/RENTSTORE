import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

const CARD_WIDTH = width * 0.6; 

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  intro: {
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  featuredPropertiesSection: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 24,
    marginBottom: 12,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  featuredList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  propertyCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16, 
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  propertyImage: {
    width: "100%",
    height: CARD_WIDTH * 0.75,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: CARD_WIDTH * 0.75,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  propertyInfo: {
    padding: 12,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  priceAndLocation: {
    marginBottom: 8,
  },
  priceText: {
    fontSize: 15,
    fontWeight: "600",
  },
  locationText: {
    fontSize: 13,
    marginTop: 4,
  },
  views: {
    fontSize: 12,
    color: "gray",
    marginTop: 4,
  },
  viewButton: {
    alignSelf: "stretch",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  viewButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  filterCard: {
    borderRadius: 12,
    padding: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});