import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { FiUpload, FiFile, FiX, FiCode } from 'react-icons/fi';

export default function Upload() {
  const [projectName, setProjectName] = useState('');
  const [files, setFiles] = useState([]);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteFiles, setPasteFiles] = useState([{ filename: '', content: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const addPasteFile = () => {
    setPasteFiles([...pasteFiles, { filename: '', content: '' }]);
  };

  const removePasteFile = (index) => {
    setPasteFiles(pasteFiles.filter((_, i) => i !== index));
  };

  const updatePasteFile = (index, field, value) => {
    const updated = [...pasteFiles];
    updated[index][field] = value;
    setPasteFiles(updated);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setError('Please enter a project name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (pasteMode) {
        const validFiles = pasteFiles.filter(f => f.filename && f.content);
        if (validFiles.length === 0) {
          setError('Please add at least one file with content');
          setLoading(false);
          return;
        }
        const res = await api.post('/projects/paste', {
          projectName,
          files: validFiles
        });
        navigate(`/project/${res.data.project.id}`);
      } else {
        if (files.length === 0) {
          setError('Please select files to upload');
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('projectName', projectName);
        files.forEach(file => formData.append('files', file));

        const res = await api.post('/projects/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        navigate(`/project/${res.data.project.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Project</h1>
        <p className="text-gray-500 mb-8">Upload your project files or paste code for AI analysis</p>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">{error}</div>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="My Awesome Project"
              required
            />
          </div>

          {/* Toggle between upload and paste */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPasteMode(false)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition ${
                !pasteMode
                  ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              <FiUpload className="inline mr-2" />
              Upload Files
            </button>
            <button
              type="button"
              onClick={() => setPasteMode(true)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition ${
                pasteMode
                  ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              <FiCode className="inline mr-2" />
              Paste Code
            </button>
          </div>

          {!pasteMode ? (
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition cursor-pointer"
                onClick={() => document.getElementById('file-input').click()}
              >
                <FiUpload size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 font-medium">Click to select files or drag & drop</p>
                <p className="text-sm text-gray-400 mt-1">Supports .js, .py, .ts, .json, .zip and more</p>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".js,.ts,.jsx,.tsx,.py,.java,.html,.css,.json,.md,.txt,.env,.yml,.yaml,.xml,.zip,.go,.rs,.cpp,.c,.h,.rb,.php,.sql,.sh,.bat"
                />
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <FiFile size={16} className="text-indigo-500" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500">
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {pasteFiles.map((file, i) => (
                <div key={i} className="bg-white p-4 rounded-lg border space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={file.filename}
                      onChange={(e) => updatePasteFile(i, 'filename', e.target.value)}
                      placeholder="filename (e.g. index.js, App.tsx)"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    {pasteFiles.length > 1 && (
                      <button type="button" onClick={() => removePasteFile(i)} className="ml-2 text-gray-400 hover:text-red-500">
                        <FiX size={16} />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={file.content}
                    onChange={(e) => updatePasteFile(i, 'content', e.target.value)}
                    placeholder="Paste your code here..."
                    className="w-full h-40 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addPasteFile}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition text-sm"
              >
                + Add another file
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition disabled:opacity-50 text-lg"
          >
            {loading ? 'Analyzing project with AI...' : 'Upload & Analyze'}
          </button>
        </form>
      </div>
    </div>
  );
}
