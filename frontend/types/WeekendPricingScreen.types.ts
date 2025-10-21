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
  guestServiceFee: number;
  guestPriceBeforeTaxes: number;
  youEarn: number;
  isVisible: boolean;
  billsIncluded?: {
    electricity: boolean;
    water: boolean;
    gas: boolean;
  };  
}
