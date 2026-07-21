import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = './data';
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Helper to hash password synchronously for seed data
const hashPassword = (pw) => bcrypt.hashSync(pw, 10);

const defaultDb = {
  users: [
    {
      id: "admin-1",
      name: "Principal Sharma",
      email: "admin@platform.com",
      password: hashPassword("admin123"),
      role: "admin",
      class: "",
      rollNo: "",
      profilePhoto: "https://api.dicebear.com/7.x/adventurer/svg?seed=admin"
    },
    {
      id: "student-class5",
      name: "Abhi Kumar",
      email: "student5@platform.com",
      password: hashPassword("student123"),
      role: "student",
      class: "Class 5",
      rollNo: "05",
      profilePhoto: "https://api.dicebear.com/7.x/adventurer/svg?seed=Abhi"
    },
    {
      id: "student-class10",
      name: "Neha Patel",
      email: "student10@platform.com",
      password: hashPassword("student123"),
      role: "student",
      class: "Class 10",
      rollNo: "12",
      profilePhoto: "https://api.dicebear.com/7.x/adventurer/svg?seed=Neha"
    }
  ],
  quizzes: [
    {
      id: "quiz-math-c5",
      title: "Introduction to Fractions",
      class: "Class 5",
      subject: "Math",
      duration: 10,
      createdBy: "admin-1",
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: "q1",
          questionText: "What is 1/2 + 1/4?",
          options: ["1/6", "3/4", "2/6", "1/8"],
          correctAnswers: [1],
          type: "single"
        },
        {
          id: "q2",
          questionText: "Which fraction is equivalent to 2/3?",
          options: ["4/6", "3/2", "2/5", "4/9"],
          correctAnswers: [0],
          type: "single"
        },
        {
          id: "q3",
          questionText: "Which of the following are proper fractions? (Select all that apply)",
          options: ["3/4", "5/4", "1/2", "7/6"],
          correctAnswers: [0, 2],
          type: "multiple"
        }
      ]
    },
    {
      id: "quiz-sci-c10",
      title: "Chemical Reactions and Equations",
      class: "Class 10",
      subject: "Science",
      duration: 15,
      createdBy: "admin-1",
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: "q10_1",
          questionText: "What happens when magnesium ribbon is burnt in air?",
          options: [
            "It turns into magnesium oxide, a white powder",
            "It melts into liquid magnesium",
            "It turns into magnesium chloride",
            "Nothing happens"
          ],
          correctAnswers: [0],
          type: "single"
        },
        {
          id: "q10_2",
          questionText: "Which of the following are examples of double displacement reactions? (Select all that apply)",
          options: [
            "Reaction of sodium sulfate and barium chloride",
            "Burning of coal",
            "Reaction of iron nail with copper sulfate",
            "Reaction of lead nitrate and potassium iodide"
          ],
          correctAnswers: [0, 3],
          type: "multiple"
        }
      ]
    }
  ],
  questionPapers: [
    {
      id: "paper-math-c5",
      title: "Class 5 Mid-Term Mathematics Exam",
      class: "Class 5",
      subject: "Math",
      fileUrl: "/uploads/papers/class5_math_midterm.pdf",
      fileName: "class5_math_midterm.pdf",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      submissions: [
        {
          id: "sub-1",
          studentId: "student-class5",
          studentName: "Abhi Kumar",
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          answerText: "Here are my final exam answers:\nQ1: 150\nQ2: 45 degrees\nQ3: Area = 36 sq cm. Attached my solution sheet.",
          answerFileUrl: "/uploads/submissions/abhi_math_exam.pdf",
          answerFileName: "abhi_math_exam.pdf",
          status: "evaluated",
          score: 85,
          feedback: "Good work on questions 1 and 2. Review formatting on question 3."
        }
      ]
    },
    {
      id: "paper-eng-c10",
      title: "Class 10 English Literature Assignment",
      class: "Class 10",
      subject: "English",
      fileUrl: "/uploads/papers/class10_english_literature.pdf",
      fileName: "class10_english_literature.pdf",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      submissions: []
    }
  ],
  notes: [
    {
      id: "note-sci-c5",
      title: "States of Matter & Phase Transitions",
      class: "Class 5",
      subject: "Science",
      fileUrl: "/uploads/notes/c5_states_of_matter.pdf",
      fileName: "c5_states_of_matter.pdf",
      uploadedBy: "admin-1",
      createdAt: new Date().toISOString()
    },
    {
      id: "note-hist-c10",
      title: "The Rise of Nationalism in Europe",
      class: "Class 10",
      subject: "Social Studies",
      fileUrl: "/uploads/notes/c10_nationalism_europe.pdf",
      fileName: "c10_nationalism_europe.pdf",
      uploadedBy: "admin-1",
      createdAt: new Date().toISOString()
    }
  ],
  results: [
    {
      id: "res-1",
      studentId: "student-class5",
      studentName: "Abhi Kumar",
      studentClass: "Class 5",
      assessmentId: "quiz-math-c5",
      assessmentTitle: "Introduction to Fractions",
      assessmentType: "quiz",
      subject: "Math",
      score: 66.6,
      maxScore: 100,
      answers: {
        "q1": [1],
        "q2": [0],
        "q3": [0] // partially correct, missed index 2
      },
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "res-2",
      studentId: "student-class5",
      studentName: "Abhi Kumar",
      studentClass: "Class 5",
      assessmentId: "paper-math-c5",
      assessmentTitle: "Class 5 Mid-Term Mathematics Exam",
      assessmentType: "paper",
      subject: "Math",
      score: 85,
      maxScore: 100,
      answers: null,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

class Database {
  constructor() {
    this.data = {};
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      this.data = defaultDb;
      this.save();
    } else {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        // Ensure all collections exist
        for (const col of Object.keys(defaultDb)) {
          if (!this.data[col]) {
            this.data[col] = [];
          }
        }
      } catch (err) {
        console.error("Error reading database file, using defaults:", err);
        this.data = defaultDb;
        this.save();
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error("Error writing database file:", err);
    }
  }

  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  // Model-like CRUD helpers
  find(collectionName, query = {}) {
    const list = this.getCollection(collectionName);
    return list.filter(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  findOne(collectionName, query = {}) {
    const list = this.getCollection(collectionName);
    return list.find(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  create(collectionName, data) {
    const list = this.getCollection(collectionName);
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      ...data
    };
    list.push(newItem);
    this.save();
    return newItem;
  }

  update(collectionName, query, updateData) {
    const list = this.getCollection(collectionName);
    let updatedCount = 0;
    
    this.data[collectionName] = list.map(item => {
      let matches = true;
      for (const key in query) {
        if (item[key] !== query[key]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        updatedCount++;
        return { ...item, ...updateData };
      }
      return item;
    });

    if (updatedCount > 0) {
      this.save();
    }
    return updatedCount;
  }

  delete(collectionName, query) {
    const list = this.getCollection(collectionName);
    const initialLen = list.length;
    
    this.data[collectionName] = list.filter(item => {
      let matches = true;
      for (const key in query) {
        if (item[key] !== query[key]) {
          matches = false;
          break;
        }
      }
      return !matches;
    });

    const deletedCount = initialLen - this.data[collectionName].length;
    if (deletedCount > 0) {
      this.save();
    }
    return deletedCount;
  }
}

const db = new Database();
export default db;
