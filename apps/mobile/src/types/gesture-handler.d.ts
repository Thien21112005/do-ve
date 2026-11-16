declare module 'react-native-gesture-handler/Swipeable' {
  import * as React from 'react';
  export interface SwipeableProps {
    children?: React.ReactNode;
    renderRightActions?: (
      progress?: any,
      dragAnimatedValue?: any,
    ) => React.ReactNode;
    renderLeftActions?: (
      progress?: any,
      dragAnimatedValue?: any,
    ) => React.ReactNode;
    onSwipeableOpen?: (direction: 'left' | 'right') => void;
    onSwipeableClose?: (direction: 'left' | 'right') => void;
    testID?: string;
  }
  const Swipeable: React.ComponentType<SwipeableProps>;
  export default Swipeable;
}

declare module 'react-native-gesture-handler/ReanimatedSwipeable' {
  import * as React from 'react';
  export interface ReanimatedSwipeableProps {
    children?: React.ReactNode;
    renderRightActions?: (
      progress?: any,
      dragAnimatedValue?: any,
      swipeableMethods?: any,
    ) => React.ReactNode;
    renderLeftActions?: (
      progress?: any,
      dragAnimatedValue?: any,
      swipeableMethods?: any,
    ) => React.ReactNode;
    onSwipeableOpen?: (direction: 'left' | 'right') => void;
    onSwipeableClose?: (direction: 'left' | 'right') => void;
    testID?: string;
  }
  const ReanimatedSwipeable: React.ComponentType<ReanimatedSwipeableProps>;
  export default ReanimatedSwipeable;
}
