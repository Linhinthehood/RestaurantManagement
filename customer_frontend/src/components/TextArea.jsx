import React from "react";

const TextArea = ({ id, rows = 3, name, placeholder, value, onChange }) => {
  return (
    <textarea
      id={id}
      rows={rows}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="mt-1 w-full rounded-xl border border-gray-300 bg-white/60 px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
    />
  );
};

export default TextArea;
