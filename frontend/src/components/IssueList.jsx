import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiEye, FiEdit3, FiTrash2, FiTag } from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';

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
    
    const request = editIssue
      ? axios.put(`http://localhost:5000/api/issues/${editIssue._id}`, formData)
      : axios.post('http://localhost:5000/api/issues', formData);

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

const IssueList = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [viewingIssue, setViewingIssue] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/issues');
      setIssues(response.data);
      setFilteredIssues(response.data);
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  useEffect(() => {
    filterIssues();
  }, [issues, searchTerm, statusFilter, priorityFilter, severityFilter]);

  const filterIssues = () => {
    let filtered = issues.filter(issue => {
      const searchMatch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'All' || issue.status === statusFilter;
      const priorityMatch = priorityFilter === 'All' || issue.priority === priorityFilter;
      const severityMatch = severityFilter === 'All' || issue.severity === severityFilter;
      
      return searchMatch && statusMatch && priorityMatch && severityMatch;
    });
    setFilteredIssues(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-blue-500 text-white',
      'In Progress': 'bg-yellow-500 text-black',
      'Testing': 'bg-purple-500 text-white',
      'Resolved': 'bg-green-500 text-white',
      'Closed': 'bg-gray-500 text-white'
    };
    return colors[status] || 'bg-gray-500 text-white';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'text-red-600',
      'Normal': 'text-yellow-600',
      'Low': 'text-green-600'
    };
    return colors[priority] || 'text-gray-500';
  };

  const deleteIssue = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/issues/${id}`);
      setIssues(issues.filter(issue => issue._id !== id));
      Swal.fire({
        title: 'Deleted!',
        text: 'Issue has been deleted successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleCreateIssue = (newIssue) => {
    setIssues([...issues, newIssue]);
    setShowModal(false);
    setEditingIssue(null);
  };

  const handleUpdateIssue = (updatedIssue) => {
    const updatedIssues = issues.map(issue => 
      issue._id === updatedIssue._id ? updatedIssue : issue
    );
    setIssues(updatedIssues);
    setShowModal(false);
    setEditingIssue(null);
  };

  const openEditModal = (issue) => {
    setEditingIssue(issue);
    setViewingIssue(null);
    setShowModal(true);
  };

  const openViewModal = (issue) => {
    setViewingIssue(issue);
    setEditingIssue(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingIssue(null);
    setViewingIssue(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setSeverityFilter('All');
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-col xl:flex-row items-center gap-6 mb-12">
        <div className="w-full xl:flex-1">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-6">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border-0 shadow-sm bg-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ height: '46px', fontSize: '16px' }}
                />
              </div>
            </div>
            
            <div className="col-span-4 md:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 rounded-lg border-0 shadow-sm bg-gray-100 font-medium text-base focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                style={{ height: '46px', fontSize: '16px' }}
              >
                <option value="All">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Testing">Testing</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            
            <div className="col-span-4 md:col-span-2">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 rounded-lg border-0 shadow-sm bg-gray-100 font-medium text-base focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                style={{ height: '46px', fontSize: '16px' }}
              >
                <option value="All">All Priority</option>
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
              </select>
            </div>
            
            <div className="col-span-4 md:col-span-2">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-3 rounded-lg border-0 shadow-sm bg-gray-100 font-medium text-base focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                style={{ height: '46px', fontSize: '16px' }}
              >
                <option value="All">All Severity</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full xl:w-auto">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center xl:justify-end"
          >
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-900 transition-all duration-200 inline-flex items-center gap-2 border-0 whitespace-nowrap justify-center"
              style={{ height: '46px', minHeight: '46px', borderRadius: '10px' }}
            >
              <span className="hidden sm:inline">Create New Issue</span>
              <span className="inline sm:hidden">Create Issue</span>
            </button>
          </motion.div>
        </div>
      </div>

      {(searchTerm || statusFilter !== 'All' || priorityFilter !== 'All' || severityFilter !== 'All') && (
        <div className="mb-12">
          <small className="text-gray-500">
            Showing {filteredIssues.length} of {issues.length} issues
            {searchTerm && ` matching "${searchTerm}"`}
            {statusFilter !== 'All' && ` with status "${statusFilter}"`}
            {priorityFilter !== 'All' && ` with priority "${priorityFilter}"`}
            {severityFilter !== 'All' && ` with severity "${severityFilter}"`}
          </small>
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredIssues.map((issue, index) => (
            <motion.div
              key={issue._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="bg-white h-full border-0 rounded-lg shadow-lg overflow-hidden">
                <div className="bg-white border-b-0 py-2 px-3">
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full shadow-sm text-sm ${getStatusColor(issue.status)}`}>
                      {issue.status}
                    </span>
                    {issue.priority && (
                      <span className={`bg-gray-100 text-gray-800 px-2 py-1 rounded-full shadow-sm text-sm ${getPriorityColor(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    )}
                  </div>
                </div>

                <div className="py-3 px-3">
                  <h6 className="font-bold text-gray-900 mb-2">{issue.title}</h6>
                  
                  {issue.description && (
                    <p className="text-gray-500 text-sm mb-2 overflow-hidden">
                      {issue.description}
                    </p>
                  )}

                  {issue.severity && (
                    <span className={`px-2 py-1 rounded text-sm ${
                      issue.severity === 'High' ? 'bg-red-500 text-white' :
                      issue.severity === 'Medium' ? 'bg-yellow-500 text-gray-900' :
                      'bg-green-500 text-white'
                    }`}>
                      {issue.severity} Severity
                    </span>
                  )}
                </div>

                <div className="bg-transparent border-t-0 py-2 px-3">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openViewModal(issue)}
                        className="text-blue-600 border border-blue-600 hover:bg-blue-100 text-sm flex items-center gap-1 px-3 py-1 rounded-lg shadow-sm transition-colors"
                        style={{ borderRadius: '5px' }}
                      >
                        <FiEye size={14} />
                        View
                      </button>
                      
                      <button 
                        onClick={() => openEditModal(issue)}
                        className="text-yellow-600 border border-yellow-600 hover:bg-yellow-100 text-sm flex items-center gap-1 px-3 py-1 rounded-lg shadow-sm transition-colors"
                        style={{ borderRadius: '5px' }}
                      >
                        <FiEdit3 size={14} />
                        Edit
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => deleteIssue(issue._id)}
                      className="text-red-600 border border-red-600 hover:bg-red-100 text-sm flex items-center gap-1 px-3 py-1 rounded-lg shadow-sm transition-colors"
                      style={{ borderRadius: '5px' }}
                    >
                      <FiTrash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredIssues.length === 0 && issues.length > 0 && (
        <motion.div 
          className="text-center py-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-muted mb-3">
            <FiSearch size={48} />
          </div>
          <h5 className="text-muted mb-2">No Issues Found</h5>
          <button 
            onClick={clearFilters}
            className="btn btn-outline-primary"
          >
            Clear Filters
          </button>
        </motion.div>
      )}

      {issues.length === 0 && (
        <motion.div 
          className="text-center py-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-muted mb-3">
            <FiTag size={48} />
          </div>
          <h5 className="text-muted mb-2">No Issues Found</h5>
          <button 
            onClick={() => setShowModal(true)}
            className="btn btn-primary d-flex align-items-center justify-content-center mx-auto gap-2"
            style={{ backgroundColor: '#1e3a8a' }}
          >
            Create New Issue
          </button>
        </motion.div>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <motion.div 
              className="modal-content border-0 shadow-lg rounded-3 overflow-hidden bg-white"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="position-relative py-4 px-4">
                <div className="d-flex justify-content-center align-items-center position-relative">
                  <div className="text-center">
                    <h5 className="modal-title text-dark mb-0 fw-bold" style={{ fontSize: '24px' }}>
                      {viewingIssue ? 'Issue Details' : editingIssue ? 'Edit Issue' : 'Create New Issue'}
                    </h5>
                  </div>
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="btn-close position-absolute end-0"
                    aria-label="Close"
                  ></button>
                </div>
              </div>

              <div className="modal-body py-4 px-4">
                <IssueForm 
                  onSubmit={editingIssue ? handleUpdateIssue : handleCreateIssue}
                  onCancel={closeModal}
                  editIssue={editingIssue || viewingIssue}
                  viewMode={!!viewingIssue}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueList;
