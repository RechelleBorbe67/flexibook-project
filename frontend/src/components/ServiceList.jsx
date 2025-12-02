import React, { useState, useEffect } from 'react';
import { serviceAPI } from '../services/api';
import './ServiceList.css';

function ServiceList({ onNavigate }) {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, categoryFilter, priceRange]);

  const fetchServices = async () => {
    try {
      const response = await serviceAPI.getAll();
      setServices(response.data.data);
      setFilteredServices(response.data.data);
      
      // Calculate max price for range
      const maxPrice = Math.max(...response.data.data.map(s => s.price));
      setPriceRange([0, maxPrice]);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load services. Please try again later.');
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    // Search by name or description
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service => service.category === categoryFilter);
    }

    // Filter by price range
    filtered = filtered.filter(service => 
      service.price >= priceRange[0] && service.price <= priceRange[1]
    );

    setFilteredServices(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value);
    setPriceRange([0, value]);
  };

  const handleBookNow = (serviceId, serviceName) => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    let user = null;
    
    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
    
    // Check if user is logged in
    if (!user || !user.token) {
      setMessage({ 
        type: 'error', 
        text: 'Please login to book an appointment.' 
      });
      
      // Store the intended service to book
      localStorage.setItem('selectedService', serviceId);
      localStorage.setItem('selectedServiceName', serviceName);
      
      // Use the onNavigate prop or window approach
      if (onNavigate) {
        onNavigate('login');
      } else {
        // If no onNavigate prop, try to trigger navigation
        window.dispatchEvent(new CustomEvent('navigate', { detail: 'login' }));
      }
      return;
    }
    
    // Check if user is admin
    if (user.role === 'admin') {
      setMessage({ 
        type: 'error', 
        text: 'Administrators cannot book appointments. Please use a customer account.' 
      });
      return;
    }
    
    // Store selected service for booking form
    localStorage.setItem('selectedService', serviceId);
    localStorage.setItem('selectedServiceName', serviceName);
    
    setMessage({ 
      type: 'success', 
      text: `Booking ${serviceName}...` 
    });
    
    // Clear message after 2 seconds
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 2000);
    
    // Navigate to booking page
    if (onNavigate) {
      onNavigate('booking');
    } else {
      // If no onNavigate prop, try to trigger navigation
      window.dispatchEvent(new CustomEvent('navigate', { 
        detail: { 
          view: 'booking',
          serviceId: serviceId 
        } 
      }));
    }
  };

  const categories = ['all', 'hair', 'nails', 'skin', 'massage', 'other'];

  if (loading) return <div className="loading">Loading services...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="service-list">
      <div className="service-list-header">
        <h2>Our Services</h2>
        <p className="services-count">{filteredServices.length} services available</p>
      </div>

      {/* Message display */}
      {message.text && (
        <div className={`service-message ${message.type}`}>
          {message.text}
          {message.type === 'error' && (
            <button 
              className="dismiss-btn" 
              onClick={() => setMessage({ type: '', text: '' })}
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="filter-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search services..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select value={categoryFilter} onChange={handleCategoryChange}>
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Max Price: ${priceRange[1]}</label>
          <input
            type="range"
            min="0"
            max={Math.max(...services.map(s => s.price))}
            value={priceRange[1]}
            onChange={handlePriceChange}
            className="price-slider"
          />
          <div className="price-range">
            <span>$0</span>
            <span>${Math.max(...services.map(s => s.price))}</span>
          </div>
        </div>

        {searchTerm || categoryFilter !== 'all' || priceRange[1] < Math.max(...services.map(s => s.price)) ? (
          <button 
            className="clear-filters"
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setPriceRange([0, Math.max(...services.map(s => s.price))]);
            }}
          >
            Clear Filters
          </button>
        ) : null}
      </div>

      {/* Services Grid */}
      <div className="services-grid">
        {filteredServices.length === 0 ? (
          <div className="no-results">
            <h3>No services found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredServices.map(service => (
            <div key={service._id} className="service-card">
              <h3>{service.name}</h3>
              <p className="description">{service.description}</p>
              <div className="service-details">
                <span className="price">${service.price}</span>
                <span className="duration">{service.duration} min</span>
                <span className="category">{service.category}</span>
              </div>
              
              {/* Status indicator */}
              <div className="service-status">
                {service.available ? (
                  <span className="available">✓ Available</span>
                ) : (
                  <span className="unavailable">✗ Unavailable</span>
                )}
              </div>
              
              {/* Book Now Button */}
              <button 
                className="book-btn" 
                onClick={() => handleBookNow(service._id, service.name)}
                disabled={!service.available}
              >
                {service.available ? 'Book Now' : 'Not Available'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ServiceList;