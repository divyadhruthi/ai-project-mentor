const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  // Stores all uploaded file contents as an array
  files: [{
    filename: String,
    path: String,
    content: String
  }],
  // AI-generated project summary
  summary: {
    type: String,
    default: ''
  },
  // AI-generated folder structure explanation
  folderStructure: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
