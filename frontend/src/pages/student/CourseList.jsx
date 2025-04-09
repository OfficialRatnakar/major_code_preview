import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CourseList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  const categories = [
    'All Categories',
    'Programming',
    'Design',
    'Business',
    'Marketing',
    'Language',
    'Science',
    'Mathematics'
  ];

  const courses = [
    {
      id: 1,
      title: 'Introduction to Web Development',
      instructor: 'John Doe',
      category: 'Programming',
      rating: 4.5,
      students: 1200,
      image: 'https://via.placeholder.com/300x200',
      price: 49.99
    },
    // Add more course examples here
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Courses</h1>
      
      {/* Search and Filter Section */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search courses..."
          className="flex-1 p-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border rounded-lg"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category.toLowerCase()}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <div
            key={course.id}
            className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
          >
            <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-2">Instructor: {course.instructor}</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-yellow-500">★ {course.rating}</span>
                <span className="text-gray-600">{course.students} students</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">${course.price}</span>
                <button
                  onClick={() => navigate(`/course/${course.id}`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  View Course
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList; 