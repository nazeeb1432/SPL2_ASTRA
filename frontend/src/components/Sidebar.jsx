import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="w-60 bg-white border-r border-gray-200 p-4">
      <nav className="flex flex-col space-y-4">
        <Link to="/dashboard" className="text-gray-700 hover:bg-gray-100 p-2 rounded-md">
          Home
        </Link>
        <Link to="/library" className="text-gray-700 hover:bg-gray-100 p-2 rounded-md">
          My Library
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
