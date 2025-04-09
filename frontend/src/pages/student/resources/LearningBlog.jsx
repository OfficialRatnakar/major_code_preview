import { useState } from 'react';

const LearningBlog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'All Categories',
    'Study Tips',
    'Career Development',
    'Technology',
    'Education News',
    'Student Success'
  ];

  const blogPosts = [
    {
      id: 1,
      title: '10 Effective Study Techniques for Online Learning',
      category: 'Study Tips',
      author: 'Sarah Johnson',
      date: '2024-03-15',
      image: 'https://via.placeholder.com/300x200',
      excerpt: 'Discover proven study techniques that will help you succeed in your online learning journey...',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'How to Build a Strong Portfolio as a Developer',
      category: 'Career Development',
      author: 'Mike Chen',
      date: '2024-03-14',
      image: 'https://via.placeholder.com/300x200',
      excerpt: 'Learn how to create a compelling portfolio that showcases your skills and projects...',
      readTime: '7 min read'
    },
    {
      id: 3,
      title: 'The Future of Online Education',
      category: 'Education News',
      author: 'Dr. Emily Brown',
      date: '2024-03-13',
      image: 'https://via.placeholder.com/300x200',
      excerpt: 'Explore the latest trends and innovations shaping the future of online education...',
      readTime: '6 min read'
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Learning Blog</h1>

      {/* Search and Filter Section */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search articles..."
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
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Featured Post */}
      {filteredPosts.length > 0 && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={filteredPosts[0].image}
                  alt={filteredPosts[0].title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="p-6 md:w-1/2">
                <span className="text-blue-600 text-sm font-medium">
                  {filteredPosts[0].category}
                </span>
                <h2 className="text-2xl font-bold mt-2 mb-4">{filteredPosts[0].title}</h2>
                <p className="text-gray-600 mb-4">{filteredPosts[0].excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-gray-600 text-sm">
                      By {filteredPosts[0].author} • {filteredPosts[0].date}
                    </span>
                  </div>
                  <span className="text-gray-500 text-sm">{filteredPosts[0].readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.slice(1).map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <span className="text-blue-600 text-sm font-medium">
                {post.category}
              </span>
              <h3 className="text-xl font-bold mt-2 mb-4">{post.title}</h3>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-gray-600 text-sm">
                    By {post.author} • {post.date}
                  </span>
                </div>
                <span className="text-gray-500 text-sm">{post.readTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
          <p className="text-gray-500">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Check back later for new articles'}
          </p>
        </div>
      )}
    </div>
  );
};

export default LearningBlog; 