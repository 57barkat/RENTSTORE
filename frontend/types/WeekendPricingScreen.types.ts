export interface WeekendPricingScreenProps {
  weekdayBasePrice?: number;
  monthlyRent?: number;  
  billsIncluded?: {
    electricity?: boolean;
    water?: boolean;
    gas?: boolean;
  };
}

export interface PriceBreakdownProps {
  basePrice: number;
  PersonServiceFee: number;
  PersonPriceBeforeTaxes: number;
  youEarn: number;
  isVisible: boolean;
  billsIncluded?: {
    electricity: boolean;
    water: boolean;
    gas: boolean;
  };  
}
