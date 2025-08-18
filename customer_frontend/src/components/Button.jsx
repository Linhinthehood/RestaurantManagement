import React from "react";
import { Link } from "react-router-dom";

const Button = ({ children, className = "", as = "button", to, ...props }) => {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
  const styles =
    "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-600";
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

export default Button;
