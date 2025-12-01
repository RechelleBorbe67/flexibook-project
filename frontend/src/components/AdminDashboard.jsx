import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [message, setMessage] = useState({ type: '', text: '' });

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
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load dashboard data' });
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data.users);
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load users' });
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/services');
      setServices(response.data.data);
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load services' });
      setLoading(false);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('token');
      await axios.delete(`/api/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Service deleted successfully' });
      fetchServices();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete service' });
    }
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

            <div className="chart-section booking-status">
              <h3>Booking Status</h3>
              <div className="status-list">
                {stats.bookingStatus.map(status => (
                  <div key={status._id} className="status-item">
                    <span className="status-name">{status._id}</span>
                    <span className="status-count">{status.count}</span>
                  </div>
                ))}
              </div>
            </div>
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
                onClick={() => setMessage({ type: 'info', text: 'Add service functionality coming soon!' })}
              >
                + Add New Service
              </button>
            </div>
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
                            onClick={() => setMessage({ type: 'info', text: 'Edit service functionality coming soon!' })}
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
            <h3>Reports & Analytics</h3>
            <div className="reports-grid">
              <div className="report-card">
                <h4>Generate Booking Report</h4>
                <p>Get detailed booking reports for any date range</p>
                <button 
                  className="generate-btn"
                  onClick={() => setMessage({ type: 'info', text: 'Report generation coming soon!' })}
                >
                  Generate Report
                </button>
              </div>
              <div className="report-card">
                <h4>Revenue Analysis</h4>
                <p>Analyze revenue trends and patterns</p>
                <button 
                  className="generate-btn"
                  onClick={() => setMessage({ type: 'info', text: 'Revenue analysis coming soon!' })}
                >
                  View Analysis
                </button>
              </div>
              <div className="report-card">
                <h4>Customer Insights</h4>
                <p>Understand customer behavior and preferences</p>
                <button 
                  className="generate-btn"
                  onClick={() => setMessage({ type: 'info', text: 'Customer insights coming soon!' })}
                >
                  View Insights
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;