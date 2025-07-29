import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    { label: "Dashboard", path: "/" },
    { label: "Table Management", path: "/table-management" },
    { label: "Orders", path: "/orders" },
    { label: "Kitchen", path: "/kitchen" },
    { label: "Register User", path: "/manager/register" },
    { label: "Inventory", path: "/manager/inventory" },
    { label: "Reports", path: "/manager/reports" },
  ];
  return (
    <div className="w-64 bg-gray-800 text-white h-full p-4">
      <h2 className="text-xl font-bold mb-6">Restaurant System</h2>
      <ul className="space-y-4">
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `block px-4 py-2 rounded hover:bg-gray-700 ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
