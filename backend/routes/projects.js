const express = require('express');
const multer = require('multer');
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const { generateSummary } = require('../utils/gemini');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.html', '.css',
      '.json', '.md', '.txt', '.env', '.yml', '.yaml', '.xml', '.zip', '.go', '.rs',
      '.cpp', '.c', '.h', '.rb', '.php', '.sql', '.sh', '.bat'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not supported`));
    }
  }
});

const textExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.html', '.css',
  '.json', '.md', '.txt', '.env', '.yml', '.yaml', '.xml', '.go', '.rs',
  '.cpp', '.c', '.h', '.rb', '.php', '.sql', '.sh', '.bat', '.toml', '.cfg'];

function isTextFile(filename) {
  return textExtensions.includes(path.extname(filename).toLowerCase());
}

router.post('/upload', auth, upload.array('files', 50), async (req, res) => {
  try {
    const { projectName } = req.body;

    if (!projectName) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    let projectFiles = [];

    for (const file of req.files) {
      if (path.extname(file.originalname).toLowerCase() === '.zip') {
        const zip = new AdmZip(file.path);
        const entries = zip.getEntries();
        for (const entry of entries) {
          if (!entry.isDirectory && isTextFile(entry.entryName)) {
            const content = entry.getData().toString('utf8');
            if (content.length < 100000) {
              projectFiles.push({
                filename: path.basename(entry.entryName),
                path: entry.entryName,
                content: content
              });
            }
          }
        }
        fs.unlinkSync(file.path);
      } else {
        const content = fs.readFileSync(file.path, 'utf8');
        projectFiles.push({
          filename: file.originalname,
          path: file.originalname,
          content: content
        });
        fs.unlinkSync(file.path);
      }
    }

    const project = new Project({
      user: req.user.id,
      name: projectName,
      files: projectFiles
    });

    const context = projectFiles.map(f => `--- File: ${f.path} ---\n${f.content}`).join('\n\n');
    project.summary = await generateSummary(context);

    await project.save();

    res.status(201).json({
      message: 'Project uploaded successfully',
      project: {
        id: project._id,
        name: project.name,
        fileCount: project.files.length,
        summary: project.summary
      }
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: err.message || 'Error uploading project' });
  }
});

router.post('/paste', auth, async (req, res) => {
  try {
    const { projectName, files } = req.body;

    if (!projectName || !files || files.length === 0) {
      return res.status(400).json({ message: 'Project name and files are required' });
    }

    const project = new Project({
      user: req.user.id,
      name: projectName,
      files: files.map(f => ({
        filename: f.filename || 'untitled',
        path: f.path || f.filename || 'untitled',
        content: f.content
      }))
    });

    const context = files.map(f => `--- File: ${f.path || f.filename} ---\n${f.content}`).join('\n\n');
    project.summary = await generateSummary(context);

    await project.save();

    res.status(201).json({
      message: 'Project saved successfully',
      project: {
        id: project._id,
        name: project.name,
        fileCount: project.files.length,
        summary: project.summary
      }
    });
  } catch (err) {
    console.error('Paste error:', err);
    res.status(500).json({ message: 'Error saving project' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id })
      .select('-files')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
