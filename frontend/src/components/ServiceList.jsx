import React, { useState, useEffect } from 'react';
import { serviceAPI } from '../services/api';
import './ServiceList.css';

function ServiceList() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100]);

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

  const categories = ['all', 'hair', 'nails', 'skin', 'massage', 'other'];

  if (loading) return <div className="loading">Loading services...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="service-list">
      <div className="service-list-header">
        <h2>Our Services</h2>
        <p className="services-count">{filteredServices.length} services available</p>
      </div>

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
              <button className="book-btn">Book Now</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ServiceList;