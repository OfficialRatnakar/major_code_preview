import { useState } from 'react';

const HelpCenter = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = [
    {
      id: 1,
      question: 'How do I enroll in a course?',
      answer: 'To enroll in a course, browse our course catalog, select a course you\'re interested in, and click the "Enroll" button. You\'ll be prompted to complete the payment process if the course is paid.'
    },
    {
      id: 2,
      question: 'How do I access my course materials?',
      answer: 'Once enrolled, you can access your course materials through the "My Learning" section. All course content, including videos, documents, and assignments, will be available there.'
    },
    {
      id: 3,
      question: 'What happens if I fail a quiz?',
      answer: 'If you fail a quiz, you can retake it after a 24-hour waiting period. You have up to 3 attempts to pass each quiz.'
    },
    {
      id: 4,
      question: 'How do I get my certificate?',
      answer: 'Certificates are automatically generated upon successful completion of a course. You can find them in the "Certificates" section of your dashboard.'
    }
  ];

  const supportTickets = [
    {
      id: 1,
      subject: 'Course access issue',
      status: 'Open',
      date: '2024-03-15',
      priority: 'High'
    },
    {
      id: 2,
      subject: 'Payment refund request',
      status: 'In Progress',
      date: '2024-03-14',
      priority: 'Medium'
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Help Center</h1>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b">
          <nav className="-mb-px flex">
            <button
              className={`py-2 px-4 border-b-2 ${
                activeTab === 'faq'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500'
              }`}
              onClick={() => setActiveTab('faq')}
            >
              FAQs
            </button>
            <button
              className={`py-2 px-4 border-b-2 ${
                activeTab === 'tickets'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500'
              }`}
              onClick={() => setActiveTab('tickets')}
            >
              Support Tickets
            </button>
            <button
              className={`py-2 px-4 border-b-2 ${
                activeTab === 'contact'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500'
              }`}
              onClick={() => setActiveTab('contact')}
            >
              Contact Us
            </button>
          </nav>
        </div>
      </div>

      {/* FAQ Section */}
      {activeTab === 'faq' && (
        <div>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search FAQs..."
              className="w-full md:w-1/2 p-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {filteredFaqs.map(faq => (
              <div key={faq.id} className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Tickets Section */}
      {activeTab === 'tickets' && (
        <div>
          <div className="mb-6">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Create New Ticket
            </button>
          </div>

          <div className="space-y-4">
            {supportTickets.map(ticket => (
              <div key={ticket.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{ticket.subject}</h3>
                    <p className="text-gray-600">Date: {ticket.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      ticket.status === 'Open' ? 'bg-red-100 text-red-800' :
                      ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ticket.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Section */}
      {activeTab === 'contact' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Contact Support</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter subject"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Message</label>
                <textarea
                  className="w-full p-2 border rounded-lg h-32"
                  placeholder="Describe your issue"
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Send Message
              </button>
            </form>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Other Ways to Reach Us</h3>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> support@lms.com
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Phone:</span> +1 (555) 123-4567
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Hours:</span> Monday - Friday, 9:00 AM - 6:00 PM EST
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpCenter; 