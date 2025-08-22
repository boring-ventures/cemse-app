import React, { useEffect } from 'react';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

interface ShimmerProps {
  children: React.ReactNode;
  duration?: number; // Animation duration in milliseconds
}

const Shimmer: React.FC<ShimmerProps> = ({ children, duration = 1500 }) => {
  const progress = useSharedValue(0.5);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1, // Infinite repetition
      true // Reverse animation
    );
  }, [duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

export default Shimmer; 