const express = require('express');
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Chat = require('../models/Chat');
const { askGemini } = require('../utils/gemini');

const router = express.Router();

router.post('/:projectId', auth, async (req, res) => {
  try {
    const { question } = req.body;
    const { projectId } = req.params;

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const project = await Project.findOne({ _id: projectId, user: req.user.id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const context = project.files
      .map(f => `--- File: ${f.path} ---\n${f.content}`)
      .join('\n\n');

    const answer = await askGemini(context, question);

    let chat = await Chat.findOne({ project: projectId, user: req.user.id });

    if (!chat) {
      chat = new Chat({
        project: projectId,
        user: req.user.id,
        messages: []
      });
    }

    chat.messages.push({ role: 'user', content: question });
    chat.messages.push({ role: 'assistant', content: answer });
    await chat.save();

    res.json({ answer, chatId: chat._id });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: 'Error getting AI response. Please try again.' });
  }
});

router.get('/:projectId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      project: req.params.projectId,
      user: req.user.id
    });

    if (!chat) {
      return res.json({ messages: [] });
    }

    res.json({ messages: chat.messages });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:projectId', auth, async (req, res) => {
  try {
    await Chat.findOneAndDelete({
      project: req.params.projectId,
      user: req.user.id
    });
    res.json({ message: 'Chat history cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
