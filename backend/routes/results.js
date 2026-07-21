import express from 'express';
import db from '../database/db.js';
import { auth, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET ALL RESULTS FOR A STUDENT
router.get('/student/:studentId', auth, (req, res) => {
  try {
    const { studentId } = req.params;

    // Check permissions (student can only fetch their own results)
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ message: "Forbidden. You can only view your own results." });
    }

    const results = db.find('results', { studentId });
    res.json(results);
  } catch (error) {
    console.error("Fetch student results error:", error);
    res.status(500).json({ message: "Error fetching student results." });
  }
});

// GET ALL RESULTS (Admin Only)
router.get('/all', auth, adminOnly, (req, res) => {
  try {
    const results = db.find('results');
    res.json(results);
  } catch (error) {
    console.error("Fetch all results error:", error);
    res.status(500).json({ message: "Error fetching all results." });
  }
});

// SUBMIT QUIZ ANSWERS AND GENERATE RESULT
router.post('/quiz-submit', auth, (req, res) => {
  try {
    const { quizId, answers } = req.body; // answers is like { q1: [1], q2: [0] }

    if (!quizId || !answers) {
      return res.status(400).json({ message: "Quiz ID and answers are required." });
    }

    const quiz = db.findOne('quizzes', { id: quizId });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    // Evaluate answers
    const questions = quiz.questions || [];
    let correctCount = 0;

    const evaluationDetails = questions.map(q => {
      const studentAnswers = answers[q.id] || [];
      const correctAnswers = q.correctAnswers || [];

      // Sort both arrays to compare
      const sortedStudent = [...studentAnswers].sort((a, b) => a - b);
      const sortedCorrect = [...correctAnswers].sort((a, b) => a - b);

      const isCorrect = sortedStudent.length === sortedCorrect.length &&
                        sortedStudent.every((val, index) => val === sortedCorrect[index]);

      if (isCorrect) {
        correctCount++;
      }

      return {
        questionId: q.id,
        studentAnswers,
        correctAnswers,
        isCorrect
      };
    });

    const score = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;
    const finalScore = Math.round(score * 10) / 10;

    // Remove existing results for this student and this quiz if they retook it
    db.delete('results', { studentId: req.user.id, assessmentId: quizId });

    // Store in results
    const resultsEntry = db.create('results', {
      studentId: req.user.id,
      studentName: req.user.name,
      studentClass: req.user.class,
      assessmentId: quizId,
      assessmentTitle: quiz.title,
      assessmentType: 'quiz',
      subject: quiz.subject,
      score: finalScore,
      maxScore: 100,
      answers, // details of selected options
      date: new Date().toISOString()
    });

    res.status(201).json({
      message: "Quiz submitted successfully.",
      score: finalScore,
      correctCount,
      totalQuestions: questions.length,
      evaluationDetails,
      resultId: resultsEntry.id
    });
  } catch (error) {
    console.error("Quiz submit error:", error);
    res.status(500).json({ message: "Error submitting quiz answers." });
  }
});

export default router;
