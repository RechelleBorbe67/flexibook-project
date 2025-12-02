import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import { adminAPI, serviceAPI, bookingAPI } from '../services/api';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import ServiceForm from './ServiceForm';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Add state for service form
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Reports section states
  const [reportStartDate, setReportStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default to last 30 days
    return date.toISOString().split('T')[0];
  });
  const [reportEndDate, setReportEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  const [reportLoading, setReportLoading] = useState(false);
  const [bookingReportData, setBookingReportData] = useState(null);
  const [revenueReportData, setRevenueReportData] = useState(null);
  const [customerReportData, setCustomerReportData] = useState(null);
  const [activeReport, setActiveReport] = useState(null);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'services') {
      fetchServices();
    } else if (activeTab === 'bookings') {
      fetchRecentBookings();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data.data);
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load dashboard data' });
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.data.users);
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load users' });
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await serviceAPI.getAll();
      setServices(response.data.data);
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load services' });
      setLoading(false);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      setRecentBookings(response.data.data.slice(0, 10));
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load bookings' });
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      await serviceAPI.delete(serviceId);
      setMessage({ type: 'success', text: 'Service deleted successfully' });
      fetchServices();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete service' });
    }
  };

  // Add function to create sample services
  const addSampleServices = async () => {
    if (!window.confirm('This will create 8 sample services (2 per category). Continue?')) return;

    const sampleServices = [
      // Hair Services
      { name: 'Hair Cut', description: 'Professional hair cutting service', price: 30, duration: 45, category: 'hair', available: true },
      { name: 'Hair Coloring', description: 'Full hair coloring service', price: 80, duration: 120, category: 'hair', available: true },
      
      // Nail Services
      { name: 'Manicure', description: 'Basic manicure service', price: 25, duration: 60, category: 'nails', available: true },
      { name: 'Gel Nails', description: 'Gel nail application', price: 45, duration: 90, category: 'nails', available: true },
      
      // Skin Services
      { name: 'Facial Treatment', description: 'Professional facial cleaning and treatment', price: 60, duration: 60, category: 'skin', available: true },
      { name: 'Skin Consultation', description: 'Skin analysis and consultation', price: 35, duration: 30, category: 'skin', available: true },
      
      // Massage Services
      { name: 'Swedish Massage', description: 'Relaxing Swedish massage', price: 70, duration: 60, category: 'massage', available: true },
      { name: 'Deep Tissue Massage', description: 'Deep tissue therapeutic massage', price: 85, duration: 90, category: 'massage', available: true }
    ];

    try {
      setLoading(true);
      const promises = sampleServices.map(service => serviceAPI.create(service));
      await Promise.all(promises);
      setMessage({ type: 'success', text: 'Sample services created successfully!' });
      fetchServices();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create sample services' });
    } finally {
      setLoading(false);
    }
  };

  // Reports functions
  const generateBookingReport = async () => {
    setReportLoading(true);
    setActiveReport('booking');
    try {
      const response = await adminAPI.getReports({
        type: 'bookings',
        startDate: reportStartDate,
        endDate: reportEndDate
      });
      
      if (response.data.success) {
        setBookingReportData(response.data.data);
        setMessage({ type: 'success', text: 'Booking report generated successfully!' });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error generating booking report:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to generate booking report' });
    } finally {
      setReportLoading(false);
    }
  };

  const generateRevenueReport = async () => {
    setReportLoading(true);
    setActiveReport('revenue');
    try {
      const response = await adminAPI.getReports({
        type: 'revenue',
        startDate: reportStartDate,
        endDate: reportEndDate
      });
      
      if (response.data.success) {
        setRevenueReportData(response.data.data);
        setMessage({ type: 'success', text: 'Revenue report generated successfully!' });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error generating revenue report:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to generate revenue report' });
    } finally {
      setReportLoading(false);
    }
  };

  const generateCustomerReport = async () => {
    setReportLoading(true);
    setActiveReport('customer');
    try {
      const usersResponse = await adminAPI.getUsers();
      const bookingsResponse = await bookingAPI.getAll();
      
      // Calculate customer insights
      const totalUsers = usersResponse.data.data.users.length;
      const newUsers = usersResponse.data.data.users.filter(user => {
        const userDate = new Date(user.createdAt);
        const startDate = new Date(reportStartDate);
        const endDate = new Date(reportEndDate);
        endDate.setHours(23, 59, 59, 999);
        return userDate >= startDate && userDate <= endDate;
      }).length;
      
      const bookings = bookingsResponse.data.data;
      
      // Calculate repeat customers
      const customerBookings = {};
      bookings.forEach(booking => {
        if (booking.customer) {
          if (!customerBookings[booking.customer._id]) {
            customerBookings[booking.customer._id] = 0;
          }
          customerBookings[booking.customer._id]++;
        }
      });
      
      const repeatCustomers = Object.values(customerBookings).filter(count => count > 1).length;
      const repeatRate = totalUsers > 0 ? (repeatCustomers / totalUsers) * 100 : 0;
      
      // Calculate popular services
      const serviceCounts = {};
      bookings.forEach(booking => {
        if (booking.service) {
          const serviceName = booking.service.name;
          if (!serviceCounts[serviceName]) {
            serviceCounts[serviceName] = 0;
          }
          serviceCounts[serviceName]++;
        }
      });
      
      const topServices = Object.entries(serviceCounts)
        .map(([serviceName, count]) => ({ serviceName, bookingCount: count }))
        .sort((a, b) => b.bookingCount - a.bookingCount)
        .slice(0, 5);
      
      setCustomerReportData({
        totalCustomers: totalUsers,
        newCustomers: newUsers,
        repeatRate: repeatRate,
        averageVisits: Object.values(customerBookings).reduce((a, b) => a + b, 0) / Math.max(Object.keys(customerBookings).length, 1),
        topServices: topServices
      });
      
      setMessage({ type: 'success', text: 'Customer insights generated successfully!' });
    } catch (error) {
      console.error('Error generating customer report:', error);
      setMessage({ type: 'error', text: 'Failed to generate customer insights' });
    } finally {
      setReportLoading(false);
    }
  };

  const exportReport = () => {
    let dataToExport = null;
    let filename = 'report';
    
    if (activeReport === 'booking' && bookingReportData) {
      dataToExport = bookingReportData;
      filename = `booking-report-${reportStartDate}-to-${reportEndDate}.json`;
    } else if (activeReport === 'revenue' && revenueReportData) {
      dataToExport = revenueReportData;
      filename = `revenue-report-${reportStartDate}-to-${reportEndDate}.json`;
    } else if (activeReport === 'customer' && customerReportData) {
      dataToExport = customerReportData;
      filename = `customer-insights-${reportStartDate}-to-${reportEndDate}.json`;
    }
    
    if (dataToExport) {
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Report exported successfully!' });
    }
  };

  const clearReports = () => {
    setBookingReportData(null);
    setRevenueReportData(null);
    setCustomerReportData(null);
    setActiveReport(null);
    setMessage({ type: 'info', text: 'Reports cleared' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  if (loading && activeTab === 'dashboard') {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <p>Manage your salon operations</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="admin-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button 
          className={activeTab === 'services' ? 'active' : ''}
          onClick={() => setActiveTab('services')}
        >
          💇 Services
        </button>
        <button 
          className={activeTab === 'bookings' ? 'active' : ''}
          onClick={() => setActiveTab('bookings')}
        >
          📅 Bookings
        </button>
        <button 
          className={activeTab === 'reports' ? 'active' : ''}
          onClick={() => setActiveTab('reports')}
        >
          📈 Reports
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && stats && (
          <div className="dashboard-grid">
            <div className="stat-card total-users">
              <h3>Total Users</h3>
              <div className="stat-value">{stats.overview.totalUsers}</div>
            </div>
            <div className="stat-card total-bookings">
              <h3>Total Bookings</h3>
              <div className="stat-value">{stats.overview.totalBookings}</div>
            </div>
            <div className="stat-card total-services">
              <h3>Total Services</h3>
              <div className="stat-value">{stats.overview.totalServices}</div>
            </div>
            <div className="stat-card today-bookings">
              <h3>Today's Bookings</h3>
              <div className="stat-value">{stats.overview.todayBookings}</div>
            </div>
            <div className="stat-card revenue">
              <h3>Revenue (7 days)</h3>
              <div className="stat-value">${stats.overview.revenue}</div>
            </div>

            {/* Add Charts Section HERE - after your existing stat cards */}
            <div className="chart-section booking-chart">
              <h3>Daily Bookings (Last 7 Days)</h3>
              <div style={{ height: '300px' }}>
                <Line 
                  data={{
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                      label: 'Bookings',
                      data: [12, 19, 8, 15, 12, 18, 10],
                      borderColor: '#667eea',
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      tension: 0.3
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </div>
            </div>

            <div className="chart-section revenue-chart">
              <h3>Revenue by Service</h3>
              <div style={{ height: '300px' }}>
                <Bar
                  data={{
                    labels: stats.popularServices.map(s => s.serviceName),
                    datasets: [{
                      label: 'Revenue ($)',
                      data: stats.popularServices.map(s => s.bookingCount * (s.price || 0)),
                      backgroundColor: [
                        '#667eea', '#764ba2', '#28a745', '#ffc107', '#dc3545'
                      ]
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '$' + value;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="chart-section status-chart">
              <h3>Booking Status Distribution</h3>
              <div style={{ height: '300px' }}>
                <Pie
                  data={{
                    labels: stats.bookingStatus.map(s => s._id),
                    datasets: [{
                      data: stats.bookingStatus.map(s => s.count),
                      backgroundColor: stats.bookingStatus.map(s => {
                        // Map status to specific colors
                        switch(s._id) {
                          case 'confirmed':
                            return '#53bd6cff'; // green
                          case 'cancelled':
                            return '#d75b68ff'; // red
                          case 'completed':
                            return '#17a2b8'; // teal
                          case 'pending':
                            return '#ffc107'; // yellow
                          case 'no-show':
                            return '#6c757d'; // gray
                          default:
                            return '#adb5bd'; // light gray
                        }
                      })
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="chart-section popular-services">
              <h3>Popular Services</h3>
              <div className="services-list">
                {stats.popularServices.map(service => (
                  <div key={service._id} className="service-item">
                    <span className="service-name">{service.serviceName}</span>
                    <span className="booking-count">{service.bookingCount} bookings</span>
                  </div>
                ))}
              </div>
            </div>

            {/* BEAUTIFUL BOOKING STATUS SECTION - REPLACED HERE */}
            <div className="chart-section booking-status">
              <h3>Booking Status</h3>
              <div className="status-cards-container">
                {stats.bookingStatus.map(status => {
                  const statusId = status._id;
                  const count = status.count;
                  
                  // Calculate percentage
                  const total = stats.bookingStatus.reduce((sum, s) => sum + (s.count || 0), 0);
                  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                  
                  // Get status styling
                  const getStatusConfig = () => {
                    switch(statusId.toLowerCase()) {
                      case 'confirmed':
                        return {
                          name: 'Confirmed',
                          color: '#10b981',
                          bgColor: 'rgba(16, 185, 129, 0.1)',
                          icon: '✓'
                        };
                      case 'cancelled':
                        return {
                          name: 'Cancelled',
                          color: '#ef4444',
                          bgColor: 'rgba(239, 68, 68, 0.1)',
                          icon: '✕'
                        };
                      case 'completed':
                        return {
                          name: 'Completed',
                          color: '#3b82f6',
                          bgColor: 'rgba(59, 130, 246, 0.1)',
                          icon: '✓'
                        };
                      case 'pending':
                        return {
                          name: 'Pending',
                          color: '#f59e0b',
                          bgColor: 'rgba(245, 158, 11, 0.1)',
                          icon: '⏱'
                        };
                      case 'no-show':
                        return {
                          name: 'No Show',
                          color: '#6b7280',
                          bgColor: 'rgba(107, 114, 128, 0.1)',
                          icon: '👤'
                        };
                      default:
                        return {
                          name: statusId.charAt(0).toUpperCase() + statusId.slice(1),
                          color: '#9ca3af',
                          bgColor: 'rgba(156, 163, 175, 0.1)',
                          icon: '?'
                        };
                    }
                  };

                  const config = getStatusConfig();
                  
                  return (
                    <div key={statusId} className="status-card" style={{ borderLeftColor: config.color }}>
                      <div className="status-card-content">
                        <div className="status-icon" style={{ 
                          backgroundColor: config.bgColor,
                          color: config.color
                        }}>
                          {config.icon}
                        </div>
                        <div className="status-info">
                          <div className="status-name">{config.name}</div>
                          <div className="status-count" style={{ color: config.color }}>
                            {count} <span className="status-label">bookings</span>
                          </div>
                        </div>
                      </div>
                      <div className="status-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: config.color
                            }}
                          />
                        </div>
                        <div className="percentage">{percentage}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* END OF BEAUTIFUL BOOKING STATUS SECTION */}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <h3>User Management</h3>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.phone || 'N/A'}</td>
                      <td>{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="users-summary">
              <p>Total Users: {users.length}</p>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="services-section">
            <div className="section-header">
              <h3>Service Management</h3>
              <button 
                className="add-service-btn"
                onClick={() => {
                  setEditingService(null);
                  setShowServiceForm(true);
                }}
              >
                + Add New Service
              </button>
            </div>

            {showServiceForm ? (
              <ServiceForm
                service={editingService}
                onSave={() => {
                  setShowServiceForm(false);
                  setEditingService(null);
                  fetchServices();
                  setMessage({ type: 'success', text: 'Service saved successfully!' });
                }}
                onCancel={() => {
                  setShowServiceForm(false);
                  setEditingService(null);
                }}
              />
            ) : (
              <>
                <div className="services-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Duration</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map(service => (
                        <tr key={service._id}>
                          <td>{service.name}</td>
                          <td className="description-cell">{service.description}</td>
                          <td>${service.price}</td>
                          <td>{service.duration} min</td>
                          <td>
                            <span className="category-badge">{service.category}</span>
                          </td>
                          <td>
                            <span className={`status-badge ${service.available ? 'available' : 'unavailable'}`}>
                              {service.available ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="edit-btn"
                                onClick={() => {
                                  setEditingService(service);
                                  setShowServiceForm(true);
                                }}
                              >
                                Edit
                              </button>
                              <button 
                                className="delete-btn"
                                onClick={() => handleDeleteService(service._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Add sample services button */}
                <div className="sample-services-section">
                  <button 
                    className="add-sample-btn"
                    onClick={addSampleServices}
                  >
                    + Add Sample Services (2 per category)
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <h3>Recent Bookings</h3>
            <div className="bookings-table">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(booking => (
                    <tr key={booking._id}>
                      <td>{booking.customer?.name || 'N/A'}</td>
                      <td>{booking.service?.name || 'N/A'}</td>
                      <td>{formatDate(booking.date)}</td>
                      <td>{formatTime(booking.startTime)}</td>
                      <td>
                        <span className={`booking-status-badge ${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>${booking.service?.price || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-section">
            <div className="section-header">
              <h3>Reports & Analytics</h3>
              <div className="report-period">
                <span>Reports Period:</span>
                <input 
                  type="date" 
                  value={reportStartDate} 
                  onChange={(e) => setReportStartDate(e.target.value)}
                />
                <span>to</span>
                <input 
                  type="date" 
                  value={reportEndDate} 
                  onChange={(e) => setReportEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="reports-grid">
              <div className="report-card">
                <div className="report-card-header">
                  <h4>Booking Reports</h4>
                  <span className="report-count">{bookingReportData?.total || 0}</span>
                </div>
                <p>Get detailed booking reports for any date range</p>
                <div className="report-stats">
                  {bookingReportData && (
                    <>
                      <div className="stat-item">
                        <span className="stat-label">Confirmed:</span>
                        <span className="stat-value">{bookingReportData.confirmed || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Pending:</span>
                        <span className="stat-value">{bookingReportData.pending || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Cancelled:</span>
                        <span className="stat-value">{bookingReportData.cancelled || 0}</span>
                      </div>
                    </>
                  )}
                </div>
                <button 
                  className="generate-btn"
                  onClick={generateBookingReport}
                  disabled={reportLoading}
                >
                  {reportLoading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>

              <div className="report-card">
                <div className="report-card-header">
                  <h4>Revenue Analysis</h4>
                  <span className="report-amount">${revenueReportData?.totalRevenue || 0}</span>
                </div>
                <p>Analyze revenue trends and patterns</p>
                <div className="report-stats">
                  {revenueReportData && (
                    <>
                      <div className="stat-item">
                        <span className="stat-label">Avg. Booking:</span>
                        <span className="stat-value">${revenueReportData.averageBookingValue?.toFixed(2) || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Bookings:</span>
                        <span className="stat-value">{revenueReportData.totalBookings || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Daily Avg:</span>
                        <span className="stat-value">${revenueReportData.dailyAverage?.toFixed(2) || 0}</span>
                      </div>
                    </>
                  )}
                </div>
                <button 
                  className="generate-btn"
                  onClick={generateRevenueReport}
                  disabled={reportLoading}
                >
                  {reportLoading ? 'Analyzing...' : 'View Analysis'}
                </button>
              </div>

              <div className="report-card">
                <div className="report-card-header">
                  <h4>Customer Insights</h4>
                  <span className="report-count">{customerReportData?.totalCustomers || 0}</span>
                </div>
                <p>Understand customer behavior and preferences</p>
                <div className="report-stats">
                  {customerReportData && (
                    <>
                      <div className="stat-item">
                        <span className="stat-label">New Customers:</span>
                        <span className="stat-value">{customerReportData.newCustomers || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Repeat Rate:</span>
                        <span className="stat-value">{customerReportData.repeatRate?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Top Service:</span>
                        <span className="stat-value">{customerReportData.topService || 'N/A'}</span>
                      </div>
                    </>
                  )}
                </div>
                <button 
                  className="generate-btn"
                  onClick={generateCustomerReport}
                  disabled={reportLoading}
                >
                  {reportLoading ? 'Analyzing...' : 'View Insights'}
                </button>
              </div>
            </div>

            {/* Report Results Section */}
            {(bookingReportData || revenueReportData || customerReportData) && (
              <div className="report-results">
                <h4>Report Results</h4>
                
                {bookingReportData && activeReport === 'booking' && (
                  <div className="report-details">
                    <div className="report-summary">
                      <h5>Booking Summary</h5>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <span>Total Bookings</span>
                          <strong>{bookingReportData.total || 0}</strong>
                        </div>
                        <div className="summary-item">
                          <span>Confirmed</span>
                          <strong style={{ color: '#10b981' }}>{bookingReportData.confirmed || 0}</strong>
                        </div>
                        <div className="summary-item">
                          <span>Pending</span>
                          <strong style={{ color: '#f59e0b' }}>{bookingReportData.pending || 0}</strong>
                        </div>
                        <div className="summary-item">
                          <span>Cancelled</span>
                          <strong style={{ color: '#ef4444' }}>{bookingReportData.cancelled || 0}</strong>
                        </div>
                      </div>
                    </div>
                    
                    {bookingReportData.bookings && bookingReportData.bookings.length > 0 && (
                      <div className="report-table">
                        <h5>Recent Bookings</h5>
                        <table>
                          <thead>
                            <tr>
                              <th>Customer</th>
                              <th>Service</th>
                              <th>Date</th>
                              <th>Time</th>
                              <th>Status</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookingReportData.bookings.slice(0, 5).map(booking => (
                              <tr key={booking._id}>
                                <td>{booking.customer?.name || 'N/A'}</td>
                                <td>{booking.service?.name || 'N/A'}</td>
                                <td>{formatDate(booking.date)}</td>
                                <td>{formatTime(booking.startTime)}</td>
                                <td>
                                  <span className={`booking-status-badge ${booking.status}`}>
                                    {booking.status}
                                  </span>
                                </td>
                                <td>${booking.service?.price || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {revenueReportData && activeReport === 'revenue' && (
                  <div className="report-details">
                    <div className="report-summary">
                      <h5>Revenue Summary</h5>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <span>Total Revenue</span>
                          <strong>${revenueReportData.totalRevenue?.toFixed(2) || 0}</strong>
                        </div>
                        <div className="summary-item">
                          <span>Total Bookings</span>
                          <strong>{revenueReportData.totalBookings || 0}</strong>
                        </div>
                        <div className="summary-item">
                          <span>Avg. per Booking</span>
                          <strong>${revenueReportData.averageBookingValue?.toFixed(2) || 0}</strong>
                        </div>
                        <div className="summary-item">
                          <span>Daily Average</span>
                          <strong>${revenueReportData.dailyAverage?.toFixed(2) || 0}</strong>
                        </div>
                      </div>
                    </div>

                    {revenueReportData.dailyData && revenueReportData.dailyData.length > 0 && (
                      <div className="chart-container">
                        <h5>Revenue Trend</h5>
                        <div style={{ height: '300px' }}>
                          <Line 
                            data={{
                              labels: revenueReportData.dailyData.map(day => 
                                new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })
                              ),
                              datasets: [{
                                label: 'Daily Revenue',
                                data: revenueReportData.dailyData.map(day => day.revenue),
                                borderColor: '#10b981',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                tension: 0.3
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    callback: function(value) {
                                      return '$' + value;
                                    }
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {customerReportData && activeReport === 'customer' && (
                  <div className="report-details">
                    <div className="report-summary">
                      <h5>Customer Insights</h5>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <span>Total Customers</span>
                          <strong>{customerReportData.totalCustomers || 0}</strong>
                        </div>
                        <div className="summary-item">
                          <span>New Customers</span>
                          <strong style={{ color: '#3b82f6' }}>{customerReportData.newCustomers || 0}</strong>
                        </div>
                        <div className="summary-item">
                          <span>Repeat Rate</span>
                          <strong style={{ color: '#8b5cf6' }}>{customerReportData.repeatRate?.toFixed(1) || 0}%</strong>
                        </div>
                        <div className="summary-item">
                          <span>Avg. Visits</span>
                          <strong>{customerReportData.averageVisits?.toFixed(1) || 0}</strong>
                        </div>
                      </div>
                    </div>

                    {customerReportData.topServices && customerReportData.topServices.length > 0 && (
                      <div className="chart-container">
                        <h5>Popular Services</h5>
                        <div style={{ height: '300px' }}>
                          <Bar
                            data={{
                              labels: customerReportData.topServices.map(s => s.serviceName),
                              datasets: [{
                                label: 'Bookings',
                                data: customerReportData.topServices.map(s => s.bookingCount),
                                backgroundColor: [
                                  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'
                                ]
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    stepSize: 1
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="report-actions">
                  <button 
                    className="export-btn"
                    onClick={exportReport}
                    disabled={reportLoading}
                  >
                    Export Report
                  </button>
                  <button 
                    className="clear-btn"
                    onClick={clearReports}
                    disabled={reportLoading}
                  >
                    Clear Results
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;