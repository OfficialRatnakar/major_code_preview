import mongoose from 'mongoose';

// Schema for individual answer options
const answerOptionSchema = new mongoose.Schema({
    optionId: { type: String, required: true },
    optionText: { type: String, required: true },
}, { _id: false });

// Schema for individual questions
const questionSchema = new mongoose.Schema({
    questionId: { type: String, required: true },
    questionText: { type: String, required: true },
    questionType: { type: String, enum: ['multiple-choice', 'true-false'], default: 'multiple-choice' },
    options: [answerOptionSchema],
    correctAnswer: { type: String, required: true }, // Reference to optionId
    points: { type: Number, default: 1 },
    order: { type: Number, required: true }
}, { _id: false });

// Schema for user quiz attempts
const attemptSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'User' },
    userName: { type: String },
    userAvatar: { type: String },
    score: { type: Number, default: 0 },
    maxScore: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
    answers: [{
        questionId: { type: String, required: true },
        selectedOption: { type: String },
        isCorrect: { type: Boolean, default: false }
    }]
}, { timestamps: true });

// Main Quiz Schema
const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    chapterId: { type: String },
    educatorId: { type: String, required: true, ref: 'User' },
    timeLimit: { type: Number }, // in minutes, optional
    passingScore: { type: Number, default: 70 }, // percentage needed to pass
    isPublished: { type: Boolean, default: false },
    questions: [questionSchema],
    attempts: [attemptSchema]
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz; 