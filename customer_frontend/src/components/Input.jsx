import React from "react";

const Input = ({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  min,
  ...rest
}) => {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      min={min}
      className="mt-1 w-full rounded-xl border border-gray-300 bg-white/60 px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
      {...rest}
    />
  );
};

export default Input;
