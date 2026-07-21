import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../database/db.js';
import { auth, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for notes uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/notes';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// GET ALL NOTES
router.get('/', auth, (req, res) => {
  try {
    const { className, subject } = req.query;
    const query = {};
    if (className) query.class = className;
    if (subject) query.subject = subject;

    let list = db.find('notes', query);

    // Filter student notes by student's class
    if (req.user.role === 'student' && !className) {
      list = list.filter(n => n.class === req.user.class);
    }

    res.json(list);
  } catch (error) {
    console.error("Fetch notes error:", error);
    res.status(500).json({ message: "Error fetching notes." });
  }
});

// UPLOAD NOTE (Admin Only)
router.post('/', auth, adminOnly, upload.single('file'), (req, res) => {
  try {
    const { title, className, subject } = req.body;

    if (!title || !className || !subject) {
      return res.status(400).json({ message: "All fields are required." });
    }

    let fileUrl = '';
    let fileName = '';

    if (req.file) {
      fileUrl = `/uploads/notes/${req.file.filename}`;
      fileName = req.file.originalname;
    } else if (req.body.fileUrl) {
      fileUrl = req.body.fileUrl;
      fileName = req.body.fileName || 'note.pdf';
    } else {
      return res.status(400).json({ message: "Please upload a notes file or provide a file URL." });
    }

    const newNote = db.create('notes', {
      title,
      class: className,
      subject,
      fileUrl,
      fileName,
      uploadedBy: req.user.id
    });

    res.status(201).json(newNote);
  } catch (error) {
    console.error("Upload note error:", error);
    res.status(500).json({ message: "Error uploading notes." });
  }
});

// DELETE NOTE (Admin Only)
router.delete('/:id', auth, adminOnly, (req, res) => {
  try {
    const deletedCount = db.delete('notes', { id: req.params.id });
    if (deletedCount === 0) {
      return res.status(404).json({ message: "Note not found." });
    }
    res.json({ message: "Note deleted successfully." });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Error deleting note." });
  }
});

export default router;
