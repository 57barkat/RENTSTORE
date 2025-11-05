// This would be a new file, e.g., components/ToggleListItem.js
import React from 'react';
import { View, Text, Switch, StyleSheet, Platform } from 'react-native';

interface ToggleListItemProps {
  label: string;
  value: boolean;
  onToggle: (newValue: boolean) => void;
}

const ToggleListItem: React.FC<ToggleListItemProps> = ({ label, value, onToggle }) => {
  return (
    <View style={toggleStyles.container}>
      <Text style={toggleStyles.label}>{label}</Text>
      <Switch
        onValueChange={onToggle}
        value={value}
        trackColor={{ false: "#767577", true: "#007AFF" }}
        thumbColor={value ? "#f4f3f4" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
      />
    </View>
  );
};

const toggleStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
    color: '#333',
    flexShrink: 1,
    marginRight: 10,
  },
});

export default ToggleListItem;