 // src/Components/ThemeToggle.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || 
        (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    } catch {
      return "dark";
    }
  });

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  const toggle = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  return (
    <motion.button
      className="btn theme-toggle"
      onClick={toggle}
      whileTap={{ scale: 0.9, rotate: 10 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <motion.span
        key={theme}
        initial={{ opacity: 0, rotate: -90 }}
        animate={{ opacity: 1, rotate: 0 }}
        exit={{ opacity: 0, rotate: 90 }}
        transition={{ duration: 0.25 }}
      >
        {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
      </motion.span>
    </motion.button>
  );
}