 // src/Components/SkeletonList.jsx
import React from "react";

export default function SkeletonList({ rows = 4 }) {
  return (
    <ul
      className="skeleton-card skeleton-list"
      aria-hidden="true"
      style={{ padding: 0, margin: 0, listStyle: "none" }}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="skeleton-row"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            margin: "10px 0",
            borderRadius: "14px",
            background: "var(--card)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            className="skeleton-avatar shimmer"
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--skeleton-bg)",
              marginRight: 12,
            }}
          />
          <div
            className="skeleton-content"
            style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}
          >
            <div
              className="skeleton-line shimmer"
              style={{
                height: 10,
                width: "80%",
                background: "var(--skeleton-bg)",
                borderRadius: 5,
              }}
            />
            <div
              className="skeleton-line shimmer"
              style={{
                height: 8,
                width: "60%",
                background: "var(--skeleton-bg)",
                borderRadius: 5,
              }}
            />
          </div>
          <div
            className="skeleton-actions shimmer"
            style={{
              width: 60,
              height: 16,
              background: "var(--skeleton-bg)",
              borderRadius: 8,
            }}
          />
        </li>
      ))}
    </ul>
  );
}