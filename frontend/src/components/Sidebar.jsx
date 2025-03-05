import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 p-6 shadow-sm shrink-0">
      <nav className="flex flex-col space-y-1">
        <Link 
          to="/library" 
          className="text-gray-600 hover:bg-blue-50 p-3 rounded-lg font-medium transition-all
                     hover:text-blue-600 flex items-center gap-3 text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
          My Library
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;