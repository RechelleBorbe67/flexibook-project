import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyBookings.css';
import { bookingAPI } from '../services/api';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('all'); // all, confirmed, cancelled, completed

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [bookings, filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data.data.bookings || []);
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load bookings' });
      setLoading(false);
    }
  };

  // Helper function to parse date correctly
  const parseBookingDateTime = (booking) => {
    try {
      // Parse the date from your booking object
      // Assuming booking.date is in format "YYYY-MM-DD"
      // and booking.startTime is in format "HH:MM"
      const dateParts = booking.date.split('-');
      const timeParts = booking.startTime.split(':');
      
      // Create date object in local timezone
      const bookingDateTime = new Date(
        parseInt(dateParts[0]), // year
        parseInt(dateParts[1]) - 1, // month (0-indexed)
        parseInt(dateParts[2]), // day
        parseInt(timeParts[0]), // hours
        parseInt(timeParts[1]) || 0 // minutes
      );
      
      return bookingDateTime;
    } catch (error) {
      console.error('Error parsing date:', error);
      // Return a future date as fallback
      return new Date('2099-12-31');
    }
  };

  const applyFilter = () => {
    if (!bookings || bookings.length === 0) {
      setFilteredBookings([]);
      return;
    }

    const now = new Date();
    console.log('Current date/time:', now.toISOString()); // For debugging

    const filtered = bookings.filter(booking => {
      const bookingDateTime = parseBookingDateTime(booking);
      console.log('Booking date/time:', bookingDateTime.toISOString(), 'for booking:', booking.service?.name); // For debugging
      
      // Check if booking should be marked as completed (past date)
      const isPastAppointment = bookingDateTime < now;
      console.log('Is past appointment?', isPastAppointment); // For debugging
      
      const effectiveStatus = (isPastAppointment && 
                              booking.status !== 'cancelled' && 
                              booking.status !== 'completed') 
                            ? 'completed' 
                            : booking.status;

      console.log('Effective status:', effectiveStatus); // For debugging

      switch (filter) {
        case 'all':
          return true;
        case 'confirmed':
          return effectiveStatus === 'confirmed';
        case 'cancelled':
          return effectiveStatus === 'cancelled';
        case 'completed':
          return effectiveStatus === 'completed' || 
                 (isPastAppointment && booking.status !== 'cancelled');
        default:
          return true;
      }
    });

    console.log('Filtered bookings count:', filtered.length); // For debugging
    setFilteredBookings(filtered);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingAPI.cancel(bookingId);
      setMessage({ type: 'success', text: 'Booking cancelled successfully' });
      fetchBookings();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to cancel booking' });
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  const getStatusBadge = (booking) => {
    const now = new Date();
    const bookingDateTime = parseBookingDateTime(booking);
    const isPastAppointment = bookingDateTime < now;
    
    // Determine the effective status
    let effectiveStatus = booking.status;
    if (isPastAppointment && 
        booking.status !== 'cancelled' && 
        booking.status !== 'completed') {
      effectiveStatus = 'completed';
    }

    const statusConfig = {
      confirmed: { class: 'status-confirmed', text: 'Confirmed' },
      cancelled: { class: 'status-cancelled', text: 'Cancelled' },
      completed: { class: 'status-completed', text: 'Completed' },
      pending: { class: 'status-pending', text: 'Pending' }
    };

    const config = statusConfig[effectiveStatus] || { class: 'status-pending', text: effectiveStatus };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const canCancelBooking = (booking) => {
    const bookingDateTime = parseBookingDateTime(booking);
    const now = new Date();
    
    const isPastAppointment = bookingDateTime < now;
    const effectiveStatus = (isPastAppointment && 
                            booking.status !== 'cancelled' && 
                            booking.status !== 'completed') 
                          ? 'completed' 
                          : booking.status;
    
    return (effectiveStatus === 'confirmed' || effectiveStatus === 'pending') && bookingDateTime > now;
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

      {filteredBookings.length === 0 ? (
        <div className="no-bookings">
          <h3>No bookings found</h3>
          <p>
            {filter === 'all' 
              ? "You haven't made any bookings yet." 
              : `No ${filter} bookings found.`}
          </p>
          <div className="debug-info">
            <p><strong>Current date:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Total bookings:</strong> {bookings.length}</p>
            <p><strong>Filter:</strong> {filter}</p>
          </div>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map(booking => (
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
                    <span className="value">
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </span>
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
                  {getStatusBadge(booking)}
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
                
                {getStatusBadge(booking).props.children === 'Completed' && (
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