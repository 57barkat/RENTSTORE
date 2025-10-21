export interface CounterInputProps {
  label: string;
  value: number;
  minValue: number;
  onIncrement: () => void;
  onDecrement: () => void;
}
export interface CapacityState {
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
}
