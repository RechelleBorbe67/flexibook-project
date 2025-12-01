import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BookingForm.css';

function BookingForm() {
  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    service: '',
    date: '',
    startTime: '',
    notes: ''
  });

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Fetch available slots when service or date changes
  useEffect(() => {
    if (formData.service && formData.date) {
      fetchAvailableSlots();
    }
  }, [formData.service, formData.date]);

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/services');
      setServices(response.data.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load services' });
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/bookings/available-slots', {
        params: {
          serviceId: formData.service,
          date: formData.date
        }
      });
      setAvailableSlots(response.data.data.availableSlots);
      setMessage({ type: '', text: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load available time slots' });
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.service) {
      setMessage({ type: 'error', text: 'Please select a service' });
      return false;
    }
    if (!formData.date) {
      setMessage({ type: 'error', text: 'Please select a date' });
      return false;
    }
    if (!formData.startTime) {
      setMessage({ type: 'error', text: 'Please select a time slot' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: 'Please login to book an appointment' });
        return;
      }

      // Calculate end time based on service duration
      const selectedService = services.find(s => s._id === formData.service);
      const startTime = new Date(`2000-01-01T${formData.startTime}`);
      const endTime = new Date(startTime.getTime() + selectedService.duration * 60000);
      const endTimeString = endTime.toTimeString().slice(0, 5);

      const bookingData = {
        service: formData.service,
        date: formData.date,
        startTime: formData.startTime,
        endTime: endTimeString,
        notes: formData.notes
      };

      const response = await axios.post('/api/bookings', bookingData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMessage({ 
        type: 'success', 
        text: 'Booking created successfully! We look forward to seeing you.' 
      });
      
      // Reset form
      setFormData({
        service: '',
        date: '',
        startTime: '',
        notes: ''
      });
      setAvailableSlots([]);

    } catch (error) {
      if (error.response?.data?.message) {
        setMessage({ type: 'error', text: error.response.data.message });
      } else {
        setMessage({ type: 'error', text: 'Failed to create booking' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="booking-form-container">
      <h2>Book Your Appointment</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="service">Select Service *</label>
          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={handleInputChange}
            required
          >
            <option value="">Choose a service...</option>
            {services.map(service => (
              <option key={service._id} value={service._id}>
                {service.name} - ${service.price} ({service.duration} min)
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Select Date *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            min={getTodayDate()}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="startTime">Select Time *</label>
          <select
            id="startTime"
            name="startTime"
            value={formData.startTime}
            onChange={handleInputChange}
            disabled={!formData.service || !formData.date || loading}
            required
          >
            <option value="">Choose a time...</option>
            {availableSlots.map(slot => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
          {loading && formData.service && formData.date && (
            <div className="loading-slots">Loading available times...</div>
          )}
          {!loading && formData.service && formData.date && availableSlots.length === 0 && (
            <div className="no-slots">No available time slots for this date</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="notes">Additional Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Any special requests or notes..."
            rows="3"
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
}

export default BookingForm;