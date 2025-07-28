import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiEye, FiEdit3, FiTrash2, FiTag } from "react-icons/fi";
import axios from "axios";
import Swal from "sweetalert2";
import IssueForm from "./IssueForm";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Check authentication
const isUserLoggedIn = () => {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  return !!(token && username);
};

const showLoginRequired = () => {
  Swal.fire({
    title: "Login Required!",
    text: "Please login first to do this!",
    icon: "warning",
    confirmButtonText: "OK",
    confirmButtonColor: "#1e3a8a",
  });
};

const IssueList = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [viewingIssue, setViewingIssue] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  // Fetch issues saved in database
  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/issues`);

      setTimeout(() => {
        setIssues(response.data);
        setFilteredIssues(response.data);
        setLoading(false);
      }, 200);
    } catch (error) {
      setLoading(false);
      Swal.fire("Error", error.message, "error");
    }
  };

  // Search function
  useEffect(() => {
    filterIssues();
  }, [issues, searchTerm, statusFilter, priorityFilter, severityFilter]);

  const filterIssues = () => {
    let filtered = issues.filter((issue) => {
      const searchMatch =
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch =
        statusFilter === "All" || issue.status === statusFilter;
      const priorityMatch =
        priorityFilter === "All" || issue.priority === priorityFilter;
      const severityMatch =
        severityFilter === "All" || issue.severity === severityFilter;

      return searchMatch && statusMatch && priorityMatch && severityMatch;
    });
    setFilteredIssues(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      Open: "bg-blue-700 text-white",
      "In Progress": "bg-blue-600 text-white",
      Testing: "bg-blue-500 text-white",
      Resolved: "bg-blue-300 text-blue-800",
      Closed: "bg-blue-200 text-blue-800",
    };
    return colors[status] || "bg-blue-500 text-white";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      High: "text-red-600",
      Normal: "text-yellow-600",
      Low: "text-green-600",
    };
    return colors[priority] || "text-gray-500";
  };

  // Issues CRUD operations
  const deleteIssue = async (id) => {
    if (!isUserLoggedIn()) {
      showLoginRequired();
      return;
    }

    const result = await Swal.fire({
      title: "Delete Issue?",
      text: "Are you sure you want to delete this issue? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE_URL}/api/issues/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIssues(issues.filter((issue) => issue._id !== id));
        Swal.fire({
          title: "Deleted!",
          text: "Issue has been deleted successfully",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  const handleCreateIssue = (newIssue) => {
    setIssues([...issues, newIssue]);
    setShowModal(false);
    setEditingIssue(null);
  };

  const handleUpdateIssue = (updatedIssue) => {
    const updatedIssues = issues.map((issue) =>
      issue._id === updatedIssue._id ? updatedIssue : issue
    );
    setIssues(updatedIssues);
    setShowModal(false);
    setEditingIssue(null);
  };

  const openCreateModal = () => {
    if (!isUserLoggedIn()) {
      showLoginRequired();
      return;
    }
    setShowModal(true);
  };

  const openEditModal = (issue) => {
    if (!isUserLoggedIn()) {
      showLoginRequired();
      return;
    }
    setEditingIssue(issue);
    setViewingIssue(null);
    setShowModal(true);
  };

  const openViewModal = (issue) => {
    if (!isUserLoggedIn()) {
      showLoginRequired();
      return;
    }
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
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setSeverityFilter("All");
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-col xl:flex-row items-center gap-6 mb-12">
        <div className="w-full xl:flex-1">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-6">
              {/* Search bar implementation */}
              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border-0 shadow-sm bg-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ height: "46px", fontSize: "16px" }}
                />
              </div>
            </div>

            {/* Other filter options */}
            <div className="col-span-4 md:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 rounded-lg border-0 shadow-sm bg-gray-100 font-medium text-base focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                style={{ height: "46px", fontSize: "16px" }}
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
                style={{ height: "46px", fontSize: "16px" }}
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
                style={{ height: "46px", fontSize: "16px" }}
              >
                <option value="All">All Severity</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal implementation */}
        <div className="flex flex-col w-full xl:w-auto">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center xl:justify-end"
          >
            <button
              onClick={openCreateModal}
              className="bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-900 transition-all duration-200 inline-flex items-center gap-2 border-0 whitespace-nowrap justify-center"
              style={{
                height: "46px",
                minHeight: "46px",
                borderRadius: "10px",
              }}
            >
              <span className="hidden sm:inline">Create New Issue</span>
              <span className="inline sm:hidden">Create Issue</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Search function implementation and show results */}
      {(searchTerm ||
        statusFilter !== "All" ||
        priorityFilter !== "All" ||
        severityFilter !== "All") && (
        <div className="mb-12">
          <small className="text-gray-500">
            Showing {filteredIssues.length} of {issues.length} issues
            {searchTerm && ` matching "${searchTerm}"`}
            {statusFilter !== "All" && ` with status "${statusFilter}"`}
            {priorityFilter !== "All" && ` with priority "${priorityFilter}"`}
            {severityFilter !== "All" && ` with severity "${severityFilter}"`}
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
                  {/* Add background color status and priority */}
                  <div className="flex justify-between items-center">
                    <span
                      className={`px-2 py-1 rounded-full shadow-sm text-sm ${getStatusColor(
                        issue.status
                      )}`}
                    >
                      {issue.status}
                    </span>
                    {issue.priority && (
                      <span
                        className={`bg-gray-100 text-gray-800 px-2 py-1 rounded-full shadow-sm text-sm ${getPriorityColor(
                          issue.priority
                        )}`}
                      >
                        {issue.priority}
                      </span>
                    )}
                  </div>
                </div>

                {/* Implementing the styles to enhance the UI/UX for issue card */}
                <div className="py-3 px-3">
                  <h6 className="font-bold text-gray-900 mb-2">
                    {issue.title}
                  </h6>

                  {issue.description && (
                    <p className="text-gray-500 text-sm mb-2 overflow-hidden">
                      {issue.description}
                    </p>
                  )}

                  {issue.severity && (
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        issue.severity === "High"
                          ? "bg-red-600 text-white"
                          : issue.severity === "Medium"
                          ? "bg-red-400 text-white"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {issue.severity} Severity
                    </span>
                  )}
                </div>

                {/* Implement the CRUD functions for each issue card in list */}
                <div className="bg-transparent border-t-0 py-2 px-3">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openViewModal(issue)}
                        className="text-blue-600 border border-blue-600 hover:bg-blue-100 text-sm flex items-center gap-1 px-3 py-1 rounded-lg shadow-sm transition-colors"
                        style={{ borderRadius: "5px" }}
                      >
                        <FiEye size={14} />
                        View
                      </button>

                      <button
                        onClick={() => openEditModal(issue)}
                        className="text-yellow-600 border border-yellow-600 hover:bg-yellow-100 text-sm flex items-center gap-1 px-3 py-1 rounded-lg shadow-sm transition-colors"
                        style={{ borderRadius: "5px" }}
                      >
                        <FiEdit3 size={14} />
                        Edit
                      </button>
                    </div>

                    <button
                      onClick={() => deleteIssue(issue._id)}
                      className="text-red-600 border border-red-600 hover:bg-red-100 text-sm flex items-center gap-1 px-3 py-1 rounded-lg shadow-sm transition-colors"
                      style={{ borderRadius: "5px" }}
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
          <button onClick={clearFilters} className="btn btn-outline-primary">
            Clear Filters
          </button>
        </motion.div>
      )}

      {/* Loading state */}
      {loading && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h5 className="text-gray-500 mb-0">Loading issues...</h5>
        </motion.div>
      )}
      {/* Modal implementations */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
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
                    <h5
                      className="modal-title text-dark mb-0 fw-bold"
                      style={{ fontSize: "24px" }}
                    >
                      {viewingIssue
                        ? "Issue Details"
                        : editingIssue
                        ? "Edit Issue"
                        : "Create New Issue"}
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
                  onSubmit={
                    editingIssue ? handleUpdateIssue : handleCreateIssue
                  }
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
