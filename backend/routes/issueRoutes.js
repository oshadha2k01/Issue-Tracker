// File: backend/routes/issueRoutes.js
const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
// const { protect } = require('../middleware/authMiddleware');

// router.use(protect);

router.post('/', issueController.createIssue);
router.get('/', issueController.getAllIssues);
router.get('/:id', issueController.getIssueById);
router.put('/:id', issueController.updateIssue);
router.delete('/:id', issueController.deleteIssue);

module.exports = router;
