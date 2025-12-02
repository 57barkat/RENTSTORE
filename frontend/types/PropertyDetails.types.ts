export interface CounterInputProps {
  label: string;
  value: number;
  minValue: number;
  onIncrement: () => void;
  onDecrement: () => void;
  textColor?: string;
  buttonColor?: string;
}
export interface CapacityState {
  Persons: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  floorLevel?: number;
}
