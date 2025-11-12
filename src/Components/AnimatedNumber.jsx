 // src/Components/AnimatedNumber.jsx
import React, { useEffect, useState } from "react";
import { useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * AnimatedNumber
 * Smoothly animates between numeric values.
 * 
 * Props:
 *  - value: target number
 *  - decimals: number of decimal places
 *  - className: optional CSS class
 */
export default function AnimatedNumber({ value = 0, decimals = 0, className = "" }) {
  const numericValue = Number(value) || 0;
  const motionValue = useMotionValue(numericValue);
  const springValue = useSpring(motionValue, { stiffness: 120, damping: 20, mass: 0.6 });
  const formattedValue = useTransform(springValue, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString()
  );

  const [display, setDisplay] = useState(() =>
    decimals > 0 ? numericValue.toFixed(decimals) : Math.round(numericValue).toString()
  );

  // Update motion value when target changes
  useEffect(() => {
    motionValue.set(numericValue);
  }, [numericValue, motionValue]);

  // Subscribe to formatted value changes
  useEffect(() => {
    const unsubscribe =
      formattedValue?.on?.("change", setDisplay) ??
      formattedValue?.onChange?.(setDisplay) ??
      (() => {});
    return unsubscribe;
  }, [formattedValue]);

  return <span className={className}>{display}</span>;
}
