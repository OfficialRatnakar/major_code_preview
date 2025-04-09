import { useState } from 'react';

const Certificates = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const certificates = [
    {
      id: 1,
      courseName: 'Introduction to Web Development',
      instructor: 'John Doe',
      issueDate: '2024-02-28',
      certificateId: 'CERT-2024-001',
      grade: 'A',
      image: 'https://via.placeholder.com/300x200'
    },
    {
      id: 2,
      courseName: 'Advanced JavaScript',
      instructor: 'Jane Smith',
      issueDate: '2024-03-01',
      certificateId: 'CERT-2024-002',
      grade: 'A+',
      image: 'https://via.placeholder.com/300x200'
    }
  ];

  const filteredCertificates = certificates.filter(cert =>
    cert.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (certificateId) => {
    // Implement certificate download logic
    console.log(`Downloading certificate ${certificateId}`);
  };

  const handleVerify = (certificateId) => {
    // Implement certificate verification logic
    console.log(`Verifying certificate ${certificateId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Certificates</h1>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search certificates..."
          className="w-full md:w-1/2 p-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCertificates.map(cert => (
          <div key={cert.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{cert.courseName}</h3>
                  <p className="text-gray-600">Instructor: {cert.instructor}</p>
                </div>
                <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  Grade: {cert.grade}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Issue Date:</span> {cert.issueDate}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Certificate ID:</span> {cert.certificateId}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleDownload(cert.certificateId)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Download Certificate
                </button>
                <button
                  onClick={() => handleVerify(cert.certificateId)}
                  className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCertificates.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No certificates found</h3>
          <p className="text-gray-500">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Complete courses to earn certificates'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Certificates; 