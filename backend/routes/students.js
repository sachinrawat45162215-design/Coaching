import express from 'express';
import db from '../database/db.js';
import { auth, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET ALL STUDENTS (Admin Only, with filtering by class)
router.get('/', auth, adminOnly, (req, res) => {
  try {
    const { className, search } = req.query;
    
    // Find all users who are students
    let students = db.find('users', { role: 'student' });

    // Filter by class if provided
    if (className) {
      students = students.filter(s => s.class === className);
    }

    // Filter by name/email if search is provided
    if (search) {
      const searchLower = search.toLowerCase();
      students = students.filter(s => 
        (s.name && s.name.toLowerCase().includes(searchLower)) ||
        (s.email && s.email.toLowerCase().includes(searchLower)) ||
        (s.rollNo && s.rollNo.includes(searchLower))
      );
    }

    // Strip out passwords for security
    const sanitizedStudents = students.map(({ password, ...userWithoutPassword }) => userWithoutPassword);

    res.json(sanitizedStudents);
  } catch (error) {
    console.error("Fetch students error:", error);
    res.status(500).json({ message: "Error fetching student list." });
  }
});

// DELETE STUDENT (Admin Only)
router.delete('/:id', auth, adminOnly, (req, res) => {
  try {
    const { id } = req.params;
    
    // Make sure we are deleting a student
    const user = db.findOne('users', { id });
    if (!user) {
      return res.status(404).json({ message: "Student not found." });
    }

    if (user.role !== 'student') {
      return res.status(400).json({ message: "Only student profiles can be deleted." });
    }

    const deletedCount = db.delete('users', { id });
    
    // Also delete any results for this student
    db.delete('results', { studentId: id });
    
    // Clean up student submissions from question papers
    const papers = db.find('questionPapers');
    papers.forEach(paper => {
      if (paper.submissions && paper.submissions.length > 0) {
        const filteredSubs = paper.submissions.filter(s => s.studentId !== id);
        if (filteredSubs.length !== paper.submissions.length) {
          db.update('questionPapers', { id: paper.id }, { submissions: filteredSubs });
        }
      }
    });

    res.json({ message: "Student account deleted successfully." });
  } catch (error) {
    console.error("Delete student error:", error);
    res.status(500).json({ message: "Error deleting student account." });
  }
});

export default router;
