import { breakdownStyles } from "@/styles/PricingScreen";
import { PriceBreakdownProps } from "@/types/PricingScreen.types";
import { FC } from "react";
import { Text, View } from "react-native";

export const PriceBreakdown: FC<PriceBreakdownProps> = ({
  basePrice,
  personserviceFeeRate,
  isVisible,
}) => {
  const personserviceFee = Math.round(basePrice * personserviceFeeRate);
  const guestPriceBeforeTaxes = basePrice + personserviceFee;
  const youEarn = basePrice - Math.round(basePrice * 0.02); // Example: 2% host service fee

  if (!isVisible) return null;

  return (
    <View style={breakdownStyles.container}>
      <View style={breakdownStyles.section}>
        <View style={breakdownStyles.row}>
          <Text style={breakdownStyles.label}>Base price</Text>
          <Text style={breakdownStyles.value}>${basePrice}</Text>
        </View>
        <View style={breakdownStyles.row}>
          <Text style={breakdownStyles.label}>Guest service fee</Text>
          <Text style={breakdownStyles.value}>${personserviceFee}</Text>
        </View>
        <View style={[breakdownStyles.row, breakdownStyles.totalRow]}>
          <Text style={breakdownStyles.label}>Guest price before taxes</Text>
          <Text style={breakdownStyles.value}>${guestPriceBeforeTaxes}</Text>
        </View>
      </View>
      <View style={breakdownStyles.section}>
        <View style={breakdownStyles.row}>
          <Text style={breakdownStyles.label}>You earn</Text>
          <Text style={breakdownStyles.value}>${youEarn}</Text>
        </View>
      </View>
    </View>
  );
};
