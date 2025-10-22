import { StyleSheet } from "react-native";

export const breakdownStyles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
  },
  section: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totalRow: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  label: {
    fontSize: 14,
    color: '#333',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});

export const styles = StyleSheet.create({
  tipText: {
    fontSize: 16,
    color: "#555",
    marginTop: 10,
    marginBottom: 25,
    textAlign: 'center',
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center', 
    height: 120,  
    justifyContent: 'center',
    marginVertical: 15,
  },
  currencySymbol: { 
    fontSize: 36,  
    fontWeight: '700',
    marginRight: 10,
  },
  priceInput: {
     
    fontSize: 36,  
    fontWeight: '700',
    minWidth: 150,
    textAlign: 'center',
    paddingVertical: 0, 
    height: 60,  
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
  },
  editIcon: {
    marginLeft: 10,
  },
  priceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  priceToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: 5,
    textDecorationLine: 'underline',
  },
  linksContainer: {
    alignItems: 'center',
    marginTop: 25,
  },
  similarListingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  similarListingsText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  learnMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textDecorationLine: 'underline',
  },
});