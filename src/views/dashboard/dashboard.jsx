import React, { useState, useEffect } from 'react'
import Layout from 'src/layout'
import axiosInstance from '../../lib/axiosInstance'
import { FaUsers, FaShoppingCart, FaBoxOpen, FaRupeeSign, FaCheckCircle, FaClock, FaTimes } from 'react-icons/fa'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axiosInstance.get('/admin/dashboard/stats')
      if (response.data.success) {
        setDashboardData(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error.response?.data || error.message)
      setDashboardData(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'successful': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <Layout title={'Dashboard'} active={'dashboard-m'}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </Layout>
    )
  }

  if (!dashboardData) {
    return (
      <Layout title={'Dashboard'} active={'dashboard-m'}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">No data available</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={'Dashboard'} active={'dashboard-m'}>
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaUsers className="text-blue-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <FaShoppingCart className="text-purple-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaRupeeSign className="text-green-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatPrice(dashboardData.stats.totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <FaBoxOpen className="text-orange-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.totalProducts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Lists Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Order Status Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Order Status Breakdown</h3>
            <div className="space-y-3">
              {dashboardData.breakdown.orderStatus?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">{item.orderStatus || 'Unknown'}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.orderStatus?.toLowerCase() === 'delivered' ? 'bg-green-500' :
                          item.orderStatus?.toLowerCase() === 'pending' ? 'bg-yellow-500' :
                            item.orderStatus?.toLowerCase() === 'cancelled' ? 'bg-red-500' :
                              'bg-blue-500'
                          }`}
                        style={{ width: `${(item.count / dashboardData.stats.totalOrders) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Status Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Payment Status</h3>
            <div className="space-y-3">
              {dashboardData.breakdown.paymentStatus?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">{item.paymentStatus || 'Unknown'}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.paymentStatus?.toLowerCase() === 'successful' ? 'bg-green-500' :
                          item.paymentStatus?.toLowerCase() === 'failed' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}
                        style={{ width: `${(item.count / dashboardData.stats.totalOrders) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders and Users */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dashboardData.recentOrders?.map((order) => (
                    <tr key={order.orderID} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">#{order.orderID}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{order.username || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatPrice(order.totalAmount)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Recent Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dashboardData.recentUsers?.map((user) => (
                    <tr key={user.uid} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.username}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{user.emailID}</td>
                      <td className="px-4 py-3 text-sm">
                        {user.verifiedEmail ? (
                          <FaCheckCircle className="text-green-600" />
                        ) : (
                          <FaTimes className="text-red-600" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
