import { useState } from 'react';

/**
 * Pressed state for Pressable without a style function.
 * NativeWind's css-interop drops `style={({ pressed }) => …}` on device,
 * so components keep `pressed` in state and pass a plain style array.
 */
export function usePressed() {
  const [pressed, setPressed] = useState(false);
  return {
    pressed,
    pressHandlers: {
      onPressIn: () => setPressed(true),
      onPressOut: () => setPressed(false),
    },
  };
}
