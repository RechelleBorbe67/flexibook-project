import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyBookings.css';
import { bookingAPI } from '../services/api';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('all'); // all, confirmed, cancelled, completed

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
  try {
    setLoading(true);
    const params = filter !== 'all' ? { status: filter } : {};
    const response = await bookingAPI.getMyBookings(params);
    setBookings(response.data.data.bookings);
    setLoading(false);
  } catch (error) {
    setMessage({ type: 'error', text: 'Failed to load bookings' });
    setLoading(false);
  }
};
  const handleCancelBooking = async (bookingId) => {
  if (!window.confirm('Are you sure you want to cancel this booking?')) {
    return;
  }

  try {
    await bookingAPI.cancel(bookingId);
    setMessage({ type: 'success', text: 'Booking cancelled successfully' });
    fetchBookings(); // Refresh the list
  } catch (error) {
    setMessage({ type: 'error', text: 'Failed to cancel booking' });
  }
};

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { class: 'status-confirmed', text: 'Confirmed' },
      cancelled: { class: 'status-cancelled', text: 'Cancelled' },
      completed: { class: 'status-completed', text: 'Completed' },
      pending: { class: 'status-pending', text: 'Pending' }
    };

    const config = statusConfig[status] || { class: 'status-pending', text: status };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const canCancelBooking = (booking) => {
    // Can only cancel confirmed or pending bookings that are in the future
    const bookingDateTime = new Date(`${booking.date}T${booking.startTime}`);
    const now = new Date();
    return (booking.status === 'confirmed' || booking.status === 'pending') && bookingDateTime > now;
  };

  if (loading) {
    return (
      <div className="my-bookings">
        <div className="loading">Loading your bookings...</div>
      </div>
    );
  }

  return (
    <div className="my-bookings">
      <div className="bookings-header">
        <h2>My Bookings</h2>
        
        <div className="bookings-controls">
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={filter === 'confirmed' ? 'active' : ''}
              onClick={() => setFilter('confirmed')}
            >
              Confirmed
            </button>
            <button 
              className={filter === 'cancelled' ? 'active' : ''}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled
            </button>
            <button 
              className={filter === 'completed' ? 'active' : ''}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <h3>No bookings found</h3>
          <p>You haven't made any bookings yet, or no bookings match your filter.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <div className="booking-info">
                <div className="service-details">
                  <h3>{booking.service?.name || 'Service'}</h3>
                  <p className="service-description">
                    {booking.service?.description || 'No description available'}
                  </p>
                </div>
                
                <div className="booking-details">
                  <div className="detail-item">
                    <span className="label">Date:</span>
                    <span className="value">{formatDate(booking.date)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Time:</span>
                    <span className="value">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Duration:</span>
                    <span className="value">{booking.service?.duration || 'N/A'} minutes</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Price:</span>
                    <span className="value">₱{booking.service?.price || 'N/A'}</span>
                  </div>
                  {booking.notes && (
                    <div className="detail-item">
                      <span className="label">Notes:</span>
                      <span className="value notes">{booking.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="booking-actions">
                <div className="booking-status">
                  {getStatusBadge(booking.status)}
                  <span className="booking-id">#{booking._id.slice(-6)}</span>
                </div>
                
                {canCancelBooking(booking) && (
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancelBooking(booking._id)}
                  >
                    Cancel Booking
                  </button>
                )}
                
                {booking.status === 'cancelled' && (
                  <span className="cancelled-note">This booking has been cancelled</span>
                )}
                
                {booking.status === 'completed' && (
                  <span className="completed-note">Service completed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;