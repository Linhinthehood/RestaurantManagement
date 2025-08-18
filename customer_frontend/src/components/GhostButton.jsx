import React from "react";
import { Link } from "react-router-dom";

const GhostButton = ({
  children,
  className = "",
  as = "button",
  to,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  const styles =
    "border border-amber-700 text-amber-800 hover:bg-amber-50 focus:ring-amber-600";
  if (as === "link") {
    return (
      <Link to={to} className={`${base} ${styles} ${className}`} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default GhostButton;
