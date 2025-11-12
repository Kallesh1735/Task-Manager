 // src/Components/Toast.jsx
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Toast
 * Props:
 *  - items: array of { id, text }
 *  - onRemove?: optional callback(id)
 */
export default function Toast({ items = [], onRemove = null }) {
  useEffect(() => {
    if (!Array.isArray(items)) return;
    // Optional cleanup if needed in future
  }, [items]);

  return (
    <div
      className="toast-container"
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            role="status"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            onClick={() => onRemove?.(t.id)}
            style={{
              background: "var(--card)",
              color: "var(--text)",
              padding: "10px 16px",
              borderRadius: 10,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              marginTop: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              cursor: onRemove ? "pointer" : "default",
              backdropFilter: "var(--blur)",
              minWidth: 180,
              textAlign: "left",
              fontSize: 14,
            }}
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}