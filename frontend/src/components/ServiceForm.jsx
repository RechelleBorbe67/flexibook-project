import React, { useState, useEffect } from 'react';
import { serviceAPI } from '../services/api';

function ServiceForm({ service, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: 30,
    category: 'hair', // Default to lowercase 'hair'
    available: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [categories, setCategories] = useState(['hair', 'nails', 'skin', 'massage', 'makeup', 'spa', 'other']);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        price: service.price?.toString() || '',
        duration: service.duration || 30,
        category: service.category || 'hair',
        available: service.available !== undefined ? service.available : true
      });
    }
    
    // Fetch existing categories from database
    const fetchExistingCategories = async () => {
      try {
        const response = await serviceAPI.getAll();
        if (response.data && response.data.data) {
          const existingCategories = [...new Set(response.data.data.map(s => s.category))];
          
          // Combine with default categories
          const allCategories = [...new Set([
            ...existingCategories,
            'hair', 'nails', 'skin', 'massage', 'makeup', 'spa', 'other'
          ])];
          
          setCategories(allCategories);
        }
      } catch (error) {
        console.log('Using default categories');
      }
    };
    
    fetchExistingCategories();
  }, [service]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Simple validation
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      setMessage({ type: 'error', text: 'Please fill all required fields' });
      setLoading(false);
      return;
    }

    try {
      const serviceData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        category: formData.category.toLowerCase(), // Ensure lowercase
        available: Boolean(formData.available)
      };

      console.log('Submitting service:', serviceData);

      let response;
      if (service && service._id) {
        response = await serviceAPI.update(service._id, serviceData);
      } else {
        response = await serviceAPI.create(serviceData);
      }

      console.log('Response:', response.data);

      setMessage({ 
        type: 'success', 
        text: service ? 'Service updated successfully!' : 'Service created successfully!' 
      });

      setTimeout(() => {
        if (onSave) onSave();
      }, 1500);

    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      
      let errorMsg = 'Failed to save service';
      const errorData = error.response?.data;
      
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        errorMsg = errorData.errors.join(', ');
      } else if (errorData?.message) {
        errorMsg = errorData.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Function to format category name for display
  const formatCategoryName = (category) => {
    if (!category) return '';
    // Capitalize first letter of each word
    return category.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="service-form">
      <h3>{service ? 'Edit Service' : 'Add New Service'}</h3>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Service Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter service name"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter service description"
            required
            rows="3"
            disabled={loading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price (₱) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Duration (minutes) *</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              min="15"
              step="5"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={loading}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {formatCategoryName(category)}
                </option>
              ))}
            </select>
            <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
              Available categories: {categories.map(c => formatCategoryName(c)).join(', ')}
            </small>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
                disabled={loading}
              />
              Available for booking
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : (service ? 'Update Service' : 'Create Service')}
          </button>
          <button 
            type="button" 
            className="cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ServiceForm;