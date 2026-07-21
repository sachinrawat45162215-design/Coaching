import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../database/db.js';
import { auth, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = './uploads/papers';
    if (req.path.includes('/submit')) {
      dir = './uploads/submissions';
    }
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

// GET ALL QUESTION PAPERS
router.get('/', auth, (req, res) => {
  try {
    const { className, subject } = req.query;
    const query = {};
    if (className) query.class = className;
    if (subject) query.subject = subject;

    let list = db.find('questionPapers', query);

    // Filter student papers by student's class
    if (req.user.role === 'student' && !className) {
      list = list.filter(p => p.class === req.user.class);
    }

    res.json(list);
  } catch (error) {
    console.error("Fetch papers error:", error);
    res.status(500).json({ message: "Error fetching question papers." });
  }
});

// UPLOAD QUESTION PAPER (Admin Only)
router.post('/', auth, adminOnly, upload.single('file'), (req, res) => {
  try {
    const { title, className, subject, dueDate } = req.body;

    if (!title || !className || !subject || !dueDate) {
      return res.status(400).json({ message: "All fields are required." });
    }

    let fileUrl = '';
    let fileName = '';

    if (req.file) {
      fileUrl = `/uploads/papers/${req.file.filename}`;
      fileName = req.file.originalname;
    } else if (req.body.fileUrl) {
      fileUrl = req.body.fileUrl;
      fileName = req.body.fileName || 'document.pdf';
    } else {
      return res.status(400).json({ message: "Please upload a file or provide a file URL." });
    }

    const newPaper = db.create('questionPapers', {
      title,
      class: className,
      subject,
      fileUrl,
      fileName,
      dueDate,
      submissions: []
    });

    res.status(201).json(newPaper);
  } catch (error) {
    console.error("Upload paper error:", error);
    res.status(500).json({ message: "Error uploading question paper." });
  }
});

// SUBMIT QUESTION PAPER ANSWER (Student Only)
router.post('/:id/submit', auth, upload.single('file'), (req, res) => {
  try {
    const { id } = req.params;
    const { answerText } = req.body;

    const paper = db.findOne('questionPapers', { id });
    if (!paper) {
      return res.status(404).json({ message: "Question paper not found." });
    }

    let answerFileUrl = '';
    let answerFileName = '';

    if (req.file) {
      answerFileUrl = `/uploads/submissions/${req.file.filename}`;
      answerFileName = req.file.originalname;
    }

    // Construct the submission object
    const newSubmission = {
      id: `sub-${Date.now()}`,
      studentId: req.user.id,
      studentName: req.user.name,
      submittedAt: new Date().toISOString(),
      answerText: answerText || '',
      answerFileUrl,
      answerFileName,
      status: 'submitted',
      score: null,
      feedback: ''
    };

    // Find and update the submissions array for this paper
    const submissions = paper.submissions || [];
    // Check if student already submitted - if so, replace/update it
    const existingSubIdx = submissions.findIndex(s => s.studentId === req.user.id);
    if (existingSubIdx > -1) {
      submissions[existingSubIdx] = newSubmission;
    } else {
      submissions.push(newSubmission);
    }

    db.update('questionPapers', { id }, { submissions });

    // Also write a record to the general results collection (status: pending/submitted)
    // First remove duplicate result for this paper and student if it exists
    db.delete('results', { studentId: req.user.id, assessmentId: id });
    
    db.create('results', {
      studentId: req.user.id,
      studentName: req.user.name,
      studentClass: req.user.class,
      assessmentId: id,
      assessmentTitle: paper.title,
      assessmentType: 'paper',
      subject: paper.subject,
      score: null, // Not yet evaluated
      maxScore: 100,
      answers: { answerText, answerFileUrl },
      date: new Date().toISOString()
    });

    res.json({ message: "Answer submitted successfully.", submission: newSubmission });
  } catch (error) {
    console.error("Submit paper answer error:", error);
    res.status(500).json({ message: "Error submitting paper answer." });
  }
});

// EVALUATE SUBMISSION (Admin Only)
router.post('/:id/evaluate', auth, adminOnly, (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, score, feedback } = req.body;

    if (!studentId || score === undefined) {
      return res.status(400).json({ message: "Student ID and score are required." });
    }

    const paper = db.findOne('questionPapers', { id });
    if (!paper) {
      return res.status(404).json({ message: "Question paper not found." });
    }

    const submissions = paper.submissions || [];
    const subIdx = submissions.findIndex(s => s.studentId === studentId);
    if (subIdx === -1) {
      return res.status(404).json({ message: "Submission not found for this student." });
    }

    // Update submission
    submissions[subIdx].status = 'evaluated';
    submissions[subIdx].score = parseFloat(score);
    submissions[subIdx].feedback = feedback || '';

    db.update('questionPapers', { id }, { submissions });

    // Also update results table
    db.update('results', 
      { studentId, assessmentId: id }, 
      { score: parseFloat(score), date: new Date().toISOString() }
    );

    res.json({ message: "Submission evaluated successfully.", submission: submissions[subIdx] });
  } catch (error) {
    console.error("Evaluate submission error:", error);
    res.status(500).json({ message: "Error evaluating submission." });
  }
});

// DELETE QUESTION PAPER (Admin Only)
router.delete('/:id', auth, adminOnly, (req, res) => {
  try {
    const deletedCount = db.delete('questionPapers', { id: req.params.id });
    if (deletedCount === 0) {
      return res.status(404).json({ message: "Question paper not found." });
    }
    // Also delete any result associated with this paper
    db.delete('results', { assessmentId: req.params.id });
    res.json({ message: "Question paper deleted successfully." });
  } catch (error) {
    console.error("Delete paper error:", error);
    res.status(500).json({ message: "Error deleting question paper." });
  }
});

export default router;
