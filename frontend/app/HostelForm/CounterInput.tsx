// This would be a new file, e.g., components/CounterInput.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Assuming FontAwesome or similar is available

interface CounterInputProps {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  minValue?: number;
}

const CounterInput: React.FC<CounterInputProps> = ({
  label,
  value,
  onIncrement,
  onDecrement,
  minValue = 0,
}) => {
  const isDecrementDisabled = value <= minValue;

  return (
    <View style={counterStyles.container}>
      <Text style={counterStyles.label}>{label}</Text>
      <View style={counterStyles.controls}>
        <TouchableOpacity
          style={[counterStyles.button, isDecrementDisabled && counterStyles.buttonDisabled]}
          onPress={onDecrement}
          disabled={isDecrementDisabled}
        >
          <FontAwesome name="minus" size={16} color={isDecrementDisabled ? '#ccc' : '#007AFF'} />
        </TouchableOpacity>
        <Text style={counterStyles.value}>{value}</Text>
        <TouchableOpacity
          style={counterStyles.button}
          onPress={onIncrement}
        >
          <FontAwesome name="plus" size={16} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const counterStyles = StyleSheet.create({
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
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  buttonDisabled: {
    borderColor: '#ccc',
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
});

export default CounterInput;