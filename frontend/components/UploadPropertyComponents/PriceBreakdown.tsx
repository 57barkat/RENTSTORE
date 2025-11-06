import { breakdownStyles } from "@/styles/PricingScreen";
import { PriceBreakdownProps } from "@/types/PricingScreen.types";
import { FC } from "react";
import { Text, View } from "react-native";

export const PriceBreakdown: FC<PriceBreakdownProps> = ({
  basePrice,
  PersonServiceFeeRate,
  isVisible,
}) => {
  const PersonServiceFee = Math.round(basePrice * PersonServiceFeeRate);
  const PersonPriceBeforeTaxes = basePrice + PersonServiceFee;
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
          <Text style={breakdownStyles.label}>Person service fee</Text>
          <Text style={breakdownStyles.value}>${PersonServiceFee}</Text>
        </View>
        <View style={[breakdownStyles.row, breakdownStyles.totalRow]}>
          <Text style={breakdownStyles.label}>Person price before taxes</Text>
          <Text style={breakdownStyles.value}>${PersonPriceBeforeTaxes}</Text>
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
