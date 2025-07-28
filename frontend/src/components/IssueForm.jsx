import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const isUserLoggedIn = () => {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  return !!(token && username);
};

const showLoginRequired = () => {
  Swal.fire({
    title: 'Login Required!',
    text: 'Please login first to do this!',
    icon: 'warning',
    confirmButtonText: 'OK',
    confirmButtonColor: '#1e3a8a'
  });
};

const IssueForm = ({ onSubmit, onCancel, editIssue, viewMode }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'Medium',
    priority: 'Normal',
    status: 'Open'
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (editIssue) {
      setFormData({
        title: editIssue.title || '',
        description: editIssue.description || '',
        severity: editIssue.severity || 'Medium',
        priority: editIssue.priority || 'Normal',
        status: editIssue.status || 'Open'
      });
    }
  }, [editIssue]);

  const validateField = (name, value) => {
    let error = '';
    
    if (name === 'title') {
      if (!value.trim()) error = 'Title is required';
      else if (value.length < 3) error = 'Title must be at least 3 characters';
      else if (value.length > 100) error = 'Title must be less than 100 characters';
    }
    
    if (name === 'description') {
      if (!value.trim()) error = 'Description is required';
      else if (value.length < 10) error = 'Description must be at least 10 characters';
      else if (value.length > 500) error = 'Description must be less than 500 characters';
    }
    
    if (name === 'severity' && !['Low', 'Medium', 'High'].includes(value)) {
      error = 'Please select a valid severity';
    }
    
    if (name === 'priority' && !['Low', 'Normal', 'High'].includes(value)) {
      error = 'Please select a valid priority';
    }
    
    if (name === 'status' && !['Open', 'In Progress', 'Testing', 'Resolved', 'Closed'].includes(value)) {
      error = 'Please select a valid status';
    }
    
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;
    
    if (name === 'title') {
      filteredValue = value.replace(/[^a-zA-Z0-9\s.,!?()-]/g, '');
    }
    if (name === 'description') {
      filteredValue = value.replace(/[^a-zA-Z0-9\s.,!?()_-]/g, '');
    }
    
    setFormData(prev => ({ ...prev, [name]: filteredValue }));
    
    if (touched[name]) {
      const error = validateField(name, filteredValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleKeyPress = (e, fieldType) => {
    const char = e.key;
    if (fieldType === 'title') {
      if (!/[a-zA-Z0-9\s.,!?()-]/.test(char) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(char)) {
        e.preventDefault();
      }
    }
    if (fieldType === 'description') {
      if (!/[a-zA-Z0-9\s.,!?()_-]/.test(char) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(char)) {
        e.preventDefault();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (viewMode) return;
    
    if (!isUserLoggedIn()) {
      showLoginRequired();
      return;
    }
    
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    
    setErrors(newErrors);
    setTouched({ title: true, description: true, severity: true, priority: true, status: true });
    
    if (Object.keys(newErrors).length > 0) {
      Swal.fire({
        title: 'Validation Error!',
        text: 'Please fix the errors before submitting.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#000080'
      });
      return;
    }
    
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    
    const request = editIssue
      ? axios.put(`${API_BASE_URL}/api/issues/${editIssue._id}`, formData, { headers })
      : axios.post(`${API_BASE_URL}/api/issues`, formData, { headers });

    request.then(res => {
      Swal.fire({
        title: 'Success!',
        text: `Issue ${editIssue ? 'updated' : 'created'} successfully`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      onSubmit(res.data);
    }).catch(err => Swal.fire('Error', err.message, 'error'));
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4">
      <div className="col-span-12">
        <label className="block text-sm font-semibold text-gray-600 mb-2">Title</label>
        <input 
          type="text" 
          name="title" 
          value={formData.title} 
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={(e) => handleKeyPress(e, 'title')}
          className={`w-full px-3 py-2 rounded-lg transition-all duration-300 outline-none ${
            viewMode ? 'bg-gray-100 border-gray-300' : 
            errors.title 
              ? 'border-2 border-red-500 focus:ring-2 focus:ring-red-200' 
              : touched.title && !errors.title 
                ? 'border-2 border-blue-500 focus:ring-2 focus:ring-blue-200' 
                : 'border-2 border-gray-300 focus:ring-2 focus:ring-blue-200'
          }`}
          style={{ height: '38px', fontSize: '16px' }}
          disabled={viewMode}
          placeholder={viewMode ? '' : 'Enter issue title...'}
          maxLength="100"
        />
        {errors.title && (
          <div className="text-red-500 text-sm mt-1">
            <i className="fas fa-exclamation-circle mr-1"></i>
            {errors.title}
          </div>
        )}
      </div>
      
      <div className="col-span-12">
        <label className="block text-sm font-semibold text-gray-600 mb-2">Description</label>
        <textarea 
          name="description" 
          value={formData.description} 
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={(e) => handleKeyPress(e, 'description')}
          className={`w-full px-3 py-2 rounded-lg transition-all duration-300 outline-none resize-none ${
            viewMode ? 'bg-gray-100 border-gray-300' : 
            errors.description 
              ? 'border-2 border-red-500 focus:ring-2 focus:ring-red-200' 
              : touched.description && !errors.description 
                ? 'border-2 border-blue-500 focus:ring-2 focus:ring-blue-200' 
                : 'border-2 border-gray-300 focus:ring-2 focus:ring-blue-200'
          }`}
          style={{ minHeight: '80px', fontSize: '16px' }}
          rows="3"
          disabled={viewMode}
          placeholder={viewMode ? '' : 'Describe the issue in detail...'}
          maxLength="500"
        />
        {errors.description && (
          <div className="text-red-500 text-sm mt-1">
            <i className="fas fa-exclamation-circle mr-1"></i>
            {errors.description}
          </div>
        )}
      </div>

      <div className="col-span-12 sm:col-span-6 lg:col-span-4">
        <label className="block text-sm font-semibold text-gray-600 mb-2">Severity</label>
        <select 
          name="severity" 
          value={formData.severity} 
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={`w-full px-3 py-2 rounded-lg transition-all duration-300 outline-none ${
            viewMode ? 'bg-gray-100 border-gray-300' : 
            errors.severity 
              ? 'border-2 border-red-500 focus:ring-2 focus:ring-red-200' 
              : touched.severity && !errors.severity 
                ? 'border-2 border-blue-500 focus:ring-2 focus:ring-blue-200' 
                : 'border-2 border-gray-300 focus:ring-2 focus:ring-blue-200'
          }`}
          style={{ height: '40px', fontSize: '16px' }}
          disabled={viewMode}
        >
          {['Low', 'Medium', 'High'].map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {errors.severity && (
          <div className="text-red-500 text-sm mt-1">
            <i className="fas fa-exclamation-circle mr-1"></i>
            {errors.severity}
          </div>
        )}
      </div>
      
      <div className="col-span-12 sm:col-span-6 lg:col-span-4">
        <label className="block text-sm font-semibold text-gray-600 mb-2">Priority</label>
        <select 
          name="priority" 
          value={formData.priority} 
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={`w-full px-3 py-2 rounded-lg transition-all duration-300 outline-none ${
            viewMode ? 'bg-gray-100 border-gray-300' : 
            errors.priority 
              ? 'border-2 border-red-500 focus:ring-2 focus:ring-red-200' 
              : touched.priority && !errors.priority 
                ? 'border-2 border-blue-500 focus:ring-2 focus:ring-blue-200' 
                : 'border-2 border-gray-300 focus:ring-2 focus:ring-blue-200'
          }`}
          style={{ height: '40px', fontSize: '16px' }}
          disabled={viewMode}
        >
          {['Low', 'Normal', 'High'].map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {errors.priority && (
          <div className="text-red-500 text-sm mt-1">
            <i className="fas fa-exclamation-circle mr-1"></i>
            {errors.priority}
          </div>
        )}
      </div>
      
      <div className="col-span-12 lg:col-span-4">
        <label className="block text-sm font-semibold text-gray-600 mb-2">Status</label>
        <select 
          name="status" 
          value={formData.status} 
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={`w-full px-3 py-2 rounded-lg transition-all duration-300 outline-none ${
            viewMode ? 'bg-gray-100 border-gray-300' : 
            errors.status 
              ? 'border-2 border-red-500 focus:ring-2 focus:ring-red-200' 
              : touched.status && !errors.status 
                ? 'border-2 border-blue-500 focus:ring-2 focus:ring-blue-200' 
                : 'border-2 border-gray-300 focus:ring-2 focus:ring-blue-200'
          }`}
          style={{ height: '40px', fontSize: '16px' }}
          disabled={viewMode}
        >
          {['Open', 'In Progress', 'Testing', 'Resolved', 'Closed'].map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {errors.status && (
          <div className="text-red-500 text-sm mt-1">
            <i className="fas fa-exclamation-circle mr-1"></i>
            {errors.status}
          </div>
        )}
      </div>
      
      <div className="col-span-12 mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          {!viewMode && (
            <>
              <button 
                type="button" 
                onClick={onCancel} 
                className="px-6 py-2 text-gray-600 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 sm:order-2"
                style={{ height: '44px', borderRadius: '5px' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 text-white bg-blue-900 hover:bg-blue-950 rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-1 shadow-md hover:shadow-lg sm:order-1"
                style={{ height: '44px', backgroundColor: '#1e3a8a', borderRadius: '5px' }}
              >
                {editIssue ? 'Update Issue' : 'Create Issue'}
              </button>
            </>
          )}
          {viewMode && (
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-6 py-2 text-white bg-blue-900 hover:bg-blue-950 rounded-lg font-semibold transition-all duration-200"
              style={{ height: '44px', backgroundColor: '#1e3a8a' }}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default IssueForm;
