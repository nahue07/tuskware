import React from "react";

export function Button({ children, className = "", onClick, variant = "default", ...props }) {
  const base = "rounded px-4 py-2 font-semibold transition-colors";
  const variants = {
    default: "bg-black text-white hover:bg-neutral-800",
    outline: "border border-black text-black hover:bg-gray-100 dark:border-white dark:text-white dark:hover:bg-white/10",
    ghost: "text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10",
  };
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
