import { useState } from 'react';

const StudentCommunity = () => {
  const [activeTab, setActiveTab] = useState('discussions');
  const [searchTerm, setSearchTerm] = useState('');

  const discussions = [
    {
      id: 1,
      title: 'Best practices for studying programming',
      author: 'John Doe',
      category: 'Study Tips',
      replies: 15,
      views: 234,
      lastActivity: '2024-03-15',
      tags: ['programming', 'study-tips']
    },
    {
      id: 2,
      title: 'Looking for study group: Web Development',
      author: 'Sarah Smith',
      category: 'Study Groups',
      replies: 8,
      views: 156,
      lastActivity: '2024-03-14',
      tags: ['web-development', 'study-group']
    },
    {
      id: 3,
      title: 'Tips for managing time during online courses',
      author: 'Mike Johnson',
      category: 'Time Management',
      replies: 12,
      views: 189,
      lastActivity: '2024-03-13',
      tags: ['time-management', 'online-learning']
    }
  ];

  const studyGroups = [
    {
      id: 1,
      name: 'Web Development Study Group',
      members: 25,
      category: 'Programming',
      meetingTime: 'Every Tuesday, 7:00 PM',
      description: 'Join us to discuss web development concepts and work on projects together.'
    },
    {
      id: 2,
      name: 'Mathematics Study Circle',
      members: 18,
      category: 'Mathematics',
      meetingTime: 'Every Thursday, 6:00 PM',
      description: 'Group study sessions for mathematics courses, including calculus and algebra.'
    },
    {
      id: 3,
      name: 'Language Learning Exchange',
      members: 32,
      category: 'Language',
      meetingTime: 'Every Saturday, 10:00 AM',
      description: 'Practice different languages with native speakers and fellow learners.'
    }
  ];

  const filteredDiscussions = discussions.filter(discussion =>
    discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discussion.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredGroups = studyGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Student Community</h1>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b">
          <nav className="-mb-px flex">
            <button
              className={`py-2 px-4 border-b-2 ${
                activeTab === 'discussions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500'
              }`}
              onClick={() => setActiveTab('discussions')}
            >
              Discussions
            </button>
            <button
              className={`py-2 px-4 border-b-2 ${
                activeTab === 'study-groups'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500'
              }`}
              onClick={() => setActiveTab('study-groups')}
            >
              Study Groups
            </button>
          </nav>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder={`Search ${activeTab === 'discussions' ? 'discussions' : 'study groups'}...`}
          className="w-full md:w-1/2 p-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Create New Button */}
      <div className="mb-8">
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {activeTab === 'discussions' ? 'Start New Discussion' : 'Create Study Group'}
        </button>
      </div>

      {/* Discussions List */}
      {activeTab === 'discussions' && (
        <div className="space-y-4">
          {filteredDiscussions.map(discussion => (
            <div key={discussion.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600 font-medium">{discussion.category}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">Posted by {discussion.author}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{discussion.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {discussion.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{discussion.replies} replies</span>
                    <span>{discussion.views} views</span>
                    <span>Last activity: {discussion.lastActivity}</span>
                  </div>
                </div>
                <button className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200">
                  Join Discussion
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Study Groups List */}
      {activeTab === 'study-groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map(group => (
            <div key={group.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-blue-600 font-medium">{group.category}</span>
                <span className="text-gray-600">{group.members} members</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
              <p className="text-gray-600 mb-4">{group.description}</p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Meeting Time: {group.meetingTime}</p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Join Group
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {(activeTab === 'discussions' && filteredDiscussions.length === 0) ||
       (activeTab === 'study-groups' && filteredGroups.length === 0) ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No results found</h3>
          <p className="text-gray-500">
            {searchTerm
              ? 'Try adjusting your search terms'
              : `Be the first to ${activeTab === 'discussions' ? 'start a discussion' : 'create a study group'}`}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default StudentCommunity; 