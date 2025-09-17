declare module 'react-native-snap-carousel' {
  import * as React from 'react';
  import { FlatListProps, ScrollViewProps, ViewStyle } from 'react-native';

  export interface CarouselProps<T> extends Partial<FlatListProps<T>>, Partial<ScrollViewProps> {
    data: T[];
    renderItem: (info: { item: T; index: number }) => React.ReactNode;
    sliderWidth: number;
    itemWidth: number;
    layout?: 'default' | 'stack' | 'tinder';
    loop?: boolean;
    autoplay?: boolean;
    containerCustomStyle?: ViewStyle;
    contentContainerCustomStyle?: ViewStyle;
  }

  export default class Carousel<T = any> extends React.Component<CarouselProps<T>> {}
}
