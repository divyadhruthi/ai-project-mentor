import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUpload, FiHome } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="text-xl font-bold text-gray-800">Project Mentor</span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition">
              <FiHome size={18} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link to="/upload" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition">
              <FiUpload size={18} />
              <span className="hidden sm:inline">Upload</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <span className="text-sm text-gray-500">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition"
            >
              <FiLogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
