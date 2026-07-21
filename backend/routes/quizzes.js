import express from 'express';
import db from '../database/db.js';
import { auth, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET ALL QUIZZES (with optional class and subject filtering)
router.get('/', auth, (req, res) => {
  try {
    const { className, subject } = req.query;
    const query = {};
    if (className) query.class = className;
    if (subject) query.subject = subject;

    // Filter using query, otherwise get all
    let list = db.find('quizzes', query);
    
    // Students should only see quizzes matching their class (if they are a student)
    if (req.user.role === 'student' && !className) {
      list = list.filter(quiz => quiz.class === req.user.class);
    }

    res.json(list);
  } catch (error) {
    console.error("Fetch quizzes error:", error);
    res.status(500).json({ message: "Error fetching quizzes." });
  }
});

// GET SINGLE QUIZ BY ID
router.get('/:id', auth, (req, res) => {
  try {
    const quiz = db.findOne('quizzes', { id: req.params.id });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }
    res.json(quiz);
  } catch (error) {
    console.error("Fetch quiz error:", error);
    res.status(500).json({ message: "Error fetching quiz." });
  }
});

// CREATE NEW QUIZ (Admin Only)
router.post('/', auth, adminOnly, (req, res) => {
  try {
    const { title, className, subject, duration, questions } = req.body;

    if (!title || !className || !subject || !duration || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "All fields and a questions array are required." });
    }

    // Format questions
    const formattedQuestions = questions.map((q, idx) => ({
      id: q.id || `q-${Date.now()}-${idx}`,
      questionText: q.questionText,
      options: q.options || [],
      correctAnswers: q.correctAnswers || [],
      type: q.type || (q.correctAnswers.length > 1 ? 'multiple' : 'single')
    }));

    const newQuiz = db.create('quizzes', {
      title,
      class: className,
      subject,
      duration: parseInt(duration),
      questions: formattedQuestions,
      createdBy: req.user.id
    });

    res.status(201).json(newQuiz);
  } catch (error) {
    console.error("Create quiz error:", error);
    res.status(500).json({ message: "Error creating quiz." });
  }
});

// DELETE QUIZ (Admin Only)
router.delete('/:id', auth, adminOnly, (req, res) => {
  try {
    const deletedCount = db.delete('quizzes', { id: req.params.id });
    if (deletedCount === 0) {
      return res.status(404).json({ message: "Quiz not found." });
    }
    res.json({ message: "Quiz deleted successfully." });
  } catch (error) {
    console.error("Delete quiz error:", error);
    res.status(500).json({ message: "Error deleting quiz." });
  }
});

export default router;
