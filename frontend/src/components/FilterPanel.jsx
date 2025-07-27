import React from "react";

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Checked-in", value: "checked-in" },
  { label: "Canceled", value: "canceled" },
];
const FilterPanel = ({ currentFilter, onFilterChange }) => {
  return (
    <div className="mb-4 text-white">
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onFilterChange(option.value)}
            className={`px-3 py-1 rounded border text-sm ${
              currentFilter === option.value
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterPanel;
