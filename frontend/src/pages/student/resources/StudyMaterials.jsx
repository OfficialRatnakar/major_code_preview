import { useState } from 'react';

const StudyMaterials = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const subjects = [
    'All Subjects',
    'Programming',
    'Mathematics',
    'Science',
    'Language',
    'Business',
    'Design',
    'History'
  ];

  const materials = [
    {
      id: 1,
      title: 'JavaScript Fundamentals Cheat Sheet',
      subject: 'Programming',
      type: 'PDF',
      size: '2.5 MB',
      downloads: 1250,
      lastUpdated: '2024-03-15',
      description: 'A comprehensive cheat sheet covering JavaScript basics, ES6+ features, and common patterns.'
    },
    {
      id: 2,
      title: 'Calculus Study Guide',
      subject: 'Mathematics',
      type: 'PDF',
      size: '5.1 MB',
      downloads: 890,
      lastUpdated: '2024-03-14',
      description: 'Complete study guide for calculus, including derivatives, integrals, and applications.'
    },
    {
      id: 3,
      title: 'Web Development Best Practices',
      subject: 'Programming',
      type: 'PDF',
      size: '3.2 MB',
      downloads: 2100,
      lastUpdated: '2024-03-13',
      description: 'Collection of best practices for web development, including HTML, CSS, and JavaScript.'
    },
    {
      id: 4,
      title: 'Business Communication Guide',
      subject: 'Business',
      type: 'PDF',
      size: '1.8 MB',
      downloads: 750,
      lastUpdated: '2024-03-12',
      description: 'Guide to effective business communication, including email etiquette and presentation skills.'
    }
  ];

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || material.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleDownload = (materialId) => {
    // Implement download logic
    console.log(`Downloading material ${materialId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Study Materials</h1>

      {/* Search and Filter Section */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search materials..."
          className="flex-1 p-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border rounded-lg"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          {subjects.map(subject => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      {/* Materials List */}
      <div className="space-y-4">
        {filteredMaterials.map(material => (
          <div key={material.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-600 font-medium">{material.subject}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{material.type}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{material.size}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{material.title}</h3>
                <p className="text-gray-600 mb-4">{material.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{material.downloads} downloads</span>
                  <span>Last updated: {material.lastUpdated}</span>
                </div>
              </div>
              <button
                onClick={() => handleDownload(material.id)}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 whitespace-nowrap"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No materials found</h3>
          <p className="text-gray-500">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Check back later for new study materials'}
          </p>
        </div>
      )}

      {/* Additional Resources Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Online Libraries</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Project Gutenberg</li>
              <li>• Internet Archive</li>
              <li>• Google Scholar</li>
              <li>• JSTOR</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Study Tools</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Quizlet</li>
              <li>• Khan Academy</li>
              <li>• Coursera</li>
              <li>• edX</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Reference Materials</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Documentation</li>
              <li>• Style Guides</li>
              <li>• Code Examples</li>
              <li>• Tutorials</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyMaterials; 