import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
      const response = await axios.get('/api/services');
      setServices(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load services');
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
