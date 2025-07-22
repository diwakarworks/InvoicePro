import React from "react";
import classNames from "classnames";

export function Card({ className, children, ...props }) {
  return (
    <div
      className={classNames(
        "rounded-2xl border bg-white p-4 shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div
      className={classNames("p-2 text-sm text-gray-700", className)}
      {...props}
    >
      {children}
    </div>
  );
}
