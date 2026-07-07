import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { FiMessageSquare, FiFile, FiArrowLeft } from 'react-icons/fi';

export default function ProjectView() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Loading project...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Project not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="text-gray-400 hover:text-gray-600">
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
            <p className="text-sm text-gray-500">{project.files.length} files uploaded</p>
          </div>
          <Link
            to={`/chat/${project._id}`}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
          >
            <FiMessageSquare size={16} />
            Ask AI
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
              activeTab === 'summary' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            AI Summary
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
              activeTab === 'files' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Files ({project.files.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'summary' ? (
          <div className="bg-white rounded-xl border p-6">
            <div className="prose prose-indigo max-w-none">
              <ReactMarkdown>{project.summary || 'No summary generated yet.'}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {project.files.map((file, i) => (
              <details key={i} className="bg-white rounded-xl border group">
                <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition">
                  <FiFile size={16} className="text-indigo-500" />
                  <span className="font-medium text-gray-700">{file.path}</span>
                </summary>
                <div className="px-5 pb-4">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{file.content}</code>
                  </pre>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
