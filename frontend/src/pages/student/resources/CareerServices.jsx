import { useState } from 'react';

const CareerServices = () => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [searchTerm, setSearchTerm] = useState('');

  const jobListings = [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'Remote',
      type: 'Full-time',
      salary: '$80,000 - $110,000',
      description: 'Looking for an experienced frontend developer with React skills to join our growing team...',
      requirements: ['3+ years of React experience', 'TypeScript knowledge', 'Experience with modern CSS'],
      postedDate: '2024-03-01'
    },
    {
      id: 2,
      title: 'Data Scientist',
      company: 'Analytics Pro',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$95,000 - $120,000',
      description: 'Join our data science team to develop machine learning models and analyze large datasets...',
      requirements: ['MS or PhD in relevant field', 'Python, R, and SQL', 'Experience with ML frameworks'],
      postedDate: '2024-03-05'
    }
  ];

  const resources = [
    {
      id: 1,
      title: 'Resume Building Workshop',
      type: 'Workshop',
      date: '2024-04-15',
      time: '10:00 AM - 12:00 PM',
      location: 'Online',
      description: 'Learn how to craft a standout resume that highlights your skills and experience.'
    },
    {
      id: 2,
      title: 'Interview Preparation Guide',
      type: 'Resource',
      format: 'PDF Document',
      description: 'A comprehensive guide to help you prepare for technical and behavioral interviews.'
    },
    {
      id: 3,
      title: 'Mock Interview Session',
      type: 'Event',
      date: '2024-04-20',
      time: '2:00 PM - 4:00 PM',
      location: 'Online',
      description: 'Practice your interview skills with industry professionals and receive feedback.'
    }
  ];

  const mentors = [
    {
      id: 1,
      name: 'Sarah Johnson',
      title: 'Senior Product Manager at Google',
      expertise: ['Product Management', 'UX Design', 'Tech Career Development'],
      image: 'https://via.placeholder.com/150',
      availability: 'Tuesdays and Thursdays'
    },
    {
      id: 2,
      name: 'David Chen',
      title: 'Software Engineering Director at Microsoft',
      expertise: ['Software Engineering', 'Technical Leadership', 'Career Transitions'],
      image: 'https://via.placeholder.com/150',
      availability: 'Wednesdays and Fridays'
    }
  ];

  const filteredJobs = jobListings.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.expertise.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Career Services</h1>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search jobs, resources, mentors..."
          className="w-full md:w-1/2 p-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b">
          <nav className="-mb-px flex">
            <button
              className={`py-2 px-4 border-b-2 ${
                activeTab === 'jobs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500'
              }`}
              onClick={() => setActiveTab('jobs')}
            >
              Job Listings
            </button>
            <button
              className={`py-2 px-4 border-b-2 ${
                activeTab === 'resources'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500'
              }`}
              onClick={() => setActiveTab('resources')}
            >
              Career Resources
            </button>
            <button
              className={`py-2 px-4 border-b-2 ${
                activeTab === 'mentors'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500'
              }`}
              onClick={() => setActiveTab('mentors')}
            >
              Mentorship
            </button>
          </nav>
        </div>
      </div>

      {/* Job Listings */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <div key={job.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{job.title}</h3>
                    <p className="text-gray-600">{job.company} • {job.location}</p>
                  </div>
                  <div className="mt-2 md:mt-0 flex gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {job.type}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {job.salary}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{job.description}</p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements:</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    {job.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Posted on {job.postedDate}</span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Apply Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold text-gray-600">No job listings found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      )}

      {/* Career Resources */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          {filteredResources.length > 0 ? (
            filteredResources.map(resource => (
              <div key={resource.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{resource.title}</h3>
                    <p className="text-blue-600 font-medium">{resource.type}</p>
                  </div>
                  {resource.date && (
                    <div className="mt-2 md:mt-0">
                      <p className="text-gray-600">{resource.date}, {resource.time}</p>
                      <p className="text-gray-600">{resource.location}</p>
                    </div>
                  )}
                  {resource.format && (
                    <div className="mt-2 md:mt-0">
                      <p className="text-gray-600">{resource.format}</p>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-700 mb-4">{resource.description}</p>
                
                <div className="flex justify-end">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    {resource.type === 'Workshop' || resource.type === 'Event' ? 'Register' : 'Download'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold text-gray-600">No resources found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      )}

      {/* Mentorship */}
      {activeTab === 'mentors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMentors.length > 0 ? (
            filteredMentors.map(mentor => (
              <div key={mentor.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex">
                  <img 
                    src={mentor.image} 
                    alt={mentor.name} 
                    className="w-20 h-20 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{mentor.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{mentor.title}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {mentor.expertise.map((skill, idx) => (
                        <span 
                          key={idx} 
                          className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">Available: {mentor.availability}</p>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Schedule Session
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8">
              <h3 className="text-xl font-semibold text-gray-600">No mentors found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CareerServices; 