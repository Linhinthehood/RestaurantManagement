import { Link } from "react-router-dom";

const Sidebar = ({ links }) => {
  return (
    <aside className="w-48 bg-gray-100 p-4 shadow">
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link key={link.path} to={link.path} className="hover:text-blue-500">
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
