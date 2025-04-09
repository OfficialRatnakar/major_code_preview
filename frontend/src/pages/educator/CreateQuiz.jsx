import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiArrowUp, FiArrowDown, FiCheck, FiX } from 'react-icons/fi';

const CreateQuiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { backendUrl, getToken } = useContext(AppContext);
  
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    timeLimit: '',
    passingScore: 70,
    questions: []
  });
  
  const [course, setCourse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    fetchCourseDetails();
  }, []);
  
  const fetchCourseDetails = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/educator/course/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        setCourse(data.course);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to fetch course details');
      console.error(error);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuiz({ ...quiz, [name]: value });
  };
  
  const addQuestion = () => {
    const newQuestion = {
      text: '',
      type: 'multiple-choice',
      options: [
        { text: '' },
        { text: '' }
      ],
      correctAnswerIndex: 0,
      points: 1
    };
    
    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion]
    });
  };
  
  const removeQuestion = (index) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions.splice(index, 1);
    setQuiz({ ...quiz, questions: updatedQuestions });
  };
  
  const moveQuestion = (index, direction) => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === quiz.questions.length - 1)) {
      return;
    }
    
    const updatedQuestions = [...quiz.questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [updatedQuestions[index], updatedQuestions[targetIndex]] = 
    [updatedQuestions[targetIndex], updatedQuestions[index]];
    
    setQuiz({ ...quiz, questions: updatedQuestions });
  };
  
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[index][field] = value;
    setQuiz({ ...quiz, questions: updatedQuestions });
  };
  
  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex].options[optionIndex].text = value;
    setQuiz({ ...quiz, questions: updatedQuestions });
  };
  
  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex].correctAnswerIndex = optionIndex;
    setQuiz({ ...quiz, questions: updatedQuestions });
  };
  
  const addOption = (questionIndex) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex].options.push({ text: '' });
    setQuiz({ ...quiz, questions: updatedQuestions });
  };
  
  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...quiz.questions];
    const question = updatedQuestions[questionIndex];
    
    // Ensure we have at least 2 options
    if (question.options.length <= 2) {
      toast.error('A question must have at least 2 options');
      return;
    }
    
    question.options.splice(optionIndex, 1);
    
    // If we removed the correct answer, default to the first option
    if (question.correctAnswerIndex === optionIndex) {
      question.correctAnswerIndex = 0;
    } else if (question.correctAnswerIndex > optionIndex) {
      // If we removed an option before the correct answer, adjust the index
      question.correctAnswerIndex--;
    }
    
    setQuiz({ ...quiz, questions: updatedQuestions });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!quiz.title.trim()) {
      toast.error('Quiz title is required');
      return;
    }
    
    if (quiz.questions.length === 0) {
      toast.error('Quiz must contain at least one question');
      return;
    }
    
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      if (!question.text.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return;
      }
      
      for (let j = 0; j < question.options.length; j++) {
        if (!question.options[j].text.trim()) {
          toast.error(`Option ${j + 1} of Question ${i + 1} text is required`);
          return;
        }
      }
    }
    
    try {
      setIsSubmitting(true);
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/quiz/create`,
        {
          ...quiz,
          courseId,
          passingScore: Number(quiz.passingScore),
          timeLimit: quiz.timeLimit ? Number(quiz.timeLimit) : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        toast.success('Quiz created successfully');
        navigate(`/educator/my-courses`, { 
          state: { fromCourseId: courseId }
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to create quiz');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Create Quiz</h1>
          {course && (
            <div className="mt-2 text-sm text-gray-600">
              For course: <span className="font-medium">{course.courseTitle}</span>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Quiz Details</h2>
            
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                <input
                  type="text"
                  name="title"
                  value={quiz.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quiz title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={quiz.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quiz description (optional)"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                  <input
                    type="number"
                    name="timeLimit"
                    value={quiz.timeLimit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Leave empty for no limit"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
                  <input
                    type="number"
                    name="passingScore"
                    value={quiz.passingScore}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter passing score percentage"
                    min="1"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                <FiPlus size={16} /> Add Question
              </button>
            </div>
            
            {quiz.questions.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No questions added yet</p>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-md mx-auto hover:bg-blue-700 transition-colors"
                >
                  <FiPlus size={16} /> Add Your First Question
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {quiz.questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium">Question {questionIndex + 1}</h3>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => moveQuestion(questionIndex, 'up')}
                          disabled={questionIndex === 0}
                          className={`p-1 rounded ${
                            questionIndex === 0 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <FiArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveQuestion(questionIndex, 'down')}
                          disabled={questionIndex === quiz.questions.length - 1}
                          className={`p-1 rounded ${
                            questionIndex === quiz.questions.length - 1 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <FiArrowDown size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeQuestion(questionIndex)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          value={question.text}
                          onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter question text"
                        />
                      </div>
                      
                      <div className="flex space-x-4 items-center">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Question Type</label>
                          <select
                            value={question.type}
                            onChange={(e) => handleQuestionChange(questionIndex, 'type', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="true-false">True/False</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Points</label>
                          <input
                            type="number"
                            value={question.points}
                            onChange={(e) => handleQuestionChange(questionIndex, 'points', Number(e.target.value))}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                        
                        {question.type === 'true-false' ? (
                          <div className="space-y-2">
                            {['True', 'False'].map((option, i) => (
                              <div key={i} className="flex items-center space-x-3">
                                <button
                                  type="button"
                                  onClick={() => handleCorrectAnswerChange(questionIndex, i)}
                                  className={`w-6 h-6 flex items-center justify-center rounded-full ${
                                    question.correctAnswerIndex === i 
                                      ? 'bg-blue-600 text-white' 
                                      : 'border border-gray-300 bg-white text-transparent'
                                  }`}
                                >
                                  <FiCheck size={14} />
                                </button>
                                <span className="flex-1 py-2 px-3 bg-white border border-gray-300 rounded-md">
                                  {option}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-3">
                                <button
                                  type="button"
                                  onClick={() => handleCorrectAnswerChange(questionIndex, optionIndex)}
                                  className={`w-6 h-6 flex items-center justify-center rounded-full ${
                                    question.correctAnswerIndex === optionIndex 
                                      ? 'bg-blue-600 text-white' 
                                      : 'border border-gray-300 bg-white text-transparent'
                                  }`}
                                >
                                  <FiCheck size={14} />
                                </button>
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeOption(questionIndex, optionIndex)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                                  disabled={question.options.length <= 2}
                                >
                                  <FiX size={16} />
                                </button>
                              </div>
                            ))}
                            
                            <button
                              type="button"
                              onClick={() => addOption(questionIndex)}
                              className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center"
                            >
                              <FiPlus size={14} className="mr-1" /> Add Option
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/educator/my-courses`, { 
                state: { fromCourseId: courseId }
              })}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuiz; 