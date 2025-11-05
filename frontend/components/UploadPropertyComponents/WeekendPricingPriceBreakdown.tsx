import { breakdownStyles } from "@/styles/WeekendPricingScreen";
import { PriceBreakdownProps } from "@/types/WeekendPricingScreen.types";
import { FC } from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const PriceBreakdown: FC<PriceBreakdownProps> = ({
  basePrice,
  personserviceFee,
  guestPriceBeforeTaxes,
  youEarn,
  billsIncluded, // new prop for bills
  isVisible,
}) => {
  if (!isVisible) return null;

  const renderBillRow = (label: string, included: boolean) => (
    <View style={breakdownStyles.row} key={label}>
      <Text style={breakdownStyles.label}>{label}</Text>
      {included ? (
        <MaterialCommunityIcons name="check-circle" size={18} color="#0AAB00" />
      ) : (
        <MaterialCommunityIcons name="close-circle" size={18} color="#E00000" />
      )}
    </View>
  );

  return (
    <View style={breakdownStyles.container}>
      {/* Price details */}
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

      {/* Earnings */}
      <View style={breakdownStyles.section}>
        <View style={breakdownStyles.row}>
          <Text style={breakdownStyles.label}>You earn</Text>
          <Text style={breakdownStyles.value}>${youEarn}</Text>
        </View>
      </View>

      {/* Bills included */}
      {billsIncluded && (
        <View style={breakdownStyles.section}>
          <Text style={[breakdownStyles.label, { fontWeight: "700", marginBottom: 10 }]}>
            Bills Included
          </Text>
          {renderBillRow("Electricity", billsIncluded.electricity)}
          {renderBillRow("Water", billsIncluded.water)}
          {renderBillRow("Gas", billsIncluded.gas)}
        </View>
      )}
    </View>
  );
};
