import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { FiFolder, FiMessageSquare, FiTrash2, FiPlus } from 'react-icons/fi';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p._id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
            <p className="text-gray-500 mt-1">Upload a project and let AI help you understand it</p>
          </div>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition shadow-md"
          >
            <FiPlus size={20} />
            New Project
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiFolder size={32} className="text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700">No projects yet</h3>
            <p className="text-gray-500 mt-2">Upload your first project to get started</p>
            <Link
              to="/upload"
              className="inline-block mt-4 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
            >
              Upload Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div key={project._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FiFolder size={20} className="text-indigo-600" />
                  </div>
                  <button
                    onClick={() => deleteProject(project._id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{project.name}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {new Date(project.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </p>
                <div className="flex gap-2">
                  <Link
                    to={`/project/${project._id}`}
                    className="flex-1 text-center py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/chat/${project._id}`}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                  >
                    <FiMessageSquare size={14} />
                    Chat
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
