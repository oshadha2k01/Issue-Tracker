// File: backend/models/Issue.js
const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  priority: { type: String, enum: ['Low', 'Normal', 'High'], default: 'Normal' },
  status: { type: String, enum: ['Open', 'In Progress', 'Testing', 'Resolved', 'Closed'], default: 'Open' },
}, { timestamps: true });

module.exports = mongoose.model('Issue', IssueSchema);
