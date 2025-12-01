import React, { useState, useEffect } from 'react';
import { serviceAPI } from '../services/api';
import './ServiceList.css';

function ServiceList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await serviceAPI.getAll();
      setServices(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load services. Please try again later.');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading services...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="service-list">
      <h2>Our Services</h2>
      <div className="services-grid">
        {services.map(service => (
          <div key={service._id} className="service-card">
            <h3>{service.name}</h3>
            <p className="description">{service.description}</p>
            <div className="service-details">
              <span className="price">${service.price}</span>
              <span className="duration">{service.duration} min</span>
              <span className="category">{service.category}</span>
            </div>
            <button className="book-btn">Book Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServiceList;
