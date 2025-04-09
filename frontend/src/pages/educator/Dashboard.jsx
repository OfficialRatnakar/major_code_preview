import { useState, useEffect, useContext } from 'react'
import { toast } from 'react-toastify'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { assets } from '../../assets/assets'

const Dashboard = () => {
  const { backendUrl, isEducator, currency, getToken } = useContext(AppContext)

  const [dashboardData, setDashboardData] = useState({
    totalEarnings: 0,
    totalEnrolledStudents: 0,
    totalCourses: 0,
    enrolledStudentsData: []
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = await getToken()
        if (!token) {
          throw new Error('No authentication token available')
        }

        console.log('Fetching dashboard data with token:', token.substring(0, 20) + '...')
        
        const response = await axios.get(`${backendUrl}/api/educator/dashboard-data`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        console.log('Dashboard response:', response.data)

        if (response.data.success) {
          const dashboardData = response.data.dashboardData;
          
          // Calculate total enrolled students based on enrolledStudentsData
          const totalEnrolledStudents = dashboardData.enrolledStudentsData ? 
            dashboardData.enrolledStudentsData.length : 0;
          
          setDashboardData({
            ...dashboardData,
            totalEnrolledStudents: totalEnrolledStudents
          });
        } else {
          throw new Error(response.data.message || 'Failed to fetch dashboard data')
        }
      } catch (err) {
        console.error('Dashboard error:', err)
        setError(err.message)
        toast.error(err.message || 'Failed to fetch dashboard data')
      } finally {
        setLoading(false)
      }
    }

    if (isEducator) {
      fetchDashboardData()
    }
  }, [isEducator, backendUrl, getToken])

  return dashboardData ? (
    <div className="p-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-4">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total Earnings</h3>
              <p className="text-3xl font-bold text-primary mt-2">${dashboardData.totalEarnings}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total Students</h3>
              <p className="text-3xl font-bold text-primary mt-2">{dashboardData.totalEnrolledStudents}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total Courses</h3>
              <p className="text-3xl font-bold text-primary mt-2">{dashboardData.totalCourses}</p>
            </div>
          </div>
          <div className='space-y-5'>
            <div className='flex flex-wrap gap-5 items-center'>
              <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md'>
                <img src={assets.patients_icon} alt="patients_icon" />
                <div>
                  <p className='text-2xl font-medium text-gray-600'>{dashboardData.enrolledStudentsData.length}</p>
                  <p className='text-base text-gray-500'>Total Enrolments</p>
                </div>
              </div>
              <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md'>
                <img src={assets.appointments_icon} alt="patients_icon" />
                <div>
                  <p className='text-2xl font-medium text-gray-600'>{dashboardData.totalCourses}</p>
                  <p className='text-base text-gray-500'>Total Courses</p>
                </div>
              </div>
              <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md'>
                <img src={assets.earning_icon} alt="patients_icon" />
                <div>
                  <p className='text-2xl font-medium text-gray-600'>{currency}{Math.floor(dashboardData.totalEarnings)}</p>
                  <p className='text-base text-gray-500'>Total Earnings</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="pb-4 text-lg font-medium">Latest Enrolments</h2>
              <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
                <table className="table-fixed md:table-auto w-full overflow-hidden">
                  <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">#</th>
                      <th className="px-4 py-3 font-semibold">Student Name</th>
                      <th className="px-4 py-3 font-semibold">Course Title</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-500">
                    {dashboardData.enrolledStudentsData.map((item, index) => (
                      <tr key={index} className="border-b border-gray-500/20">
                        <td className="px-4 py-3 text-center hidden sm:table-cell">{index + 1}</td>
                        <td className="md:px-4 px-2 py-3 flex items-center space-x-3">
                          <img
                            src={item.student.imageUrl}
                            alt="Profile"
                            className="w-9 h-9 rounded-full"
                          />
                          <span className="truncate">{item.student.name}</span>
                        </td>
                        <td className="px-4 py-3 truncate">{item.courseTitle}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  ) : null
}

export default Dashboard