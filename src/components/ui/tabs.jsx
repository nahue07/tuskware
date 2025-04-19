import React from "react";
import { useState } from "react";

export function Tabs({ children, defaultValue, className = "" }) {
  const [value, setValue] = useState(defaultValue);
  const context = { value, setValue };
  return <div className={className}>{React.Children.map(children, (child) => React.cloneElement(child, { context }))}</div>;
}

export function TabsList({ children, className = "", context }) {
  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { context, key: child.props.value }) // Asegúrate de pasar una key única aquí
      )}
    </div>
  );
}

export function TabsTrigger({ children, value, className = "", context }) {
  const active = context.value === value;
  return (
    <button
      onClick={() => context.setValue(value)}
      className={`${className} px-4 py-2 font-semibold border-b-2 transition-colors ${
        active ? "border-black dark:border-white" : "border-transparent text-gray-400"
      }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, context }) {
  return context.value === value ? <div className="mt-4">{children}</div> : null;
}