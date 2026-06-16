const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Application = require('../models/Application');

// @route   GET /api/applications
// @desc    Get all job applications for logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id }).sort({
      createdAt: -1
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/applications
// @desc    Add a new job application tracking card
// @access  Private
router.post('/', protect, async (req, res) => {
  const { company, role, status, notes, appliedDate } = req.body;

  try {
    if (!company || !role) {
      return res.status(400).json({ message: 'Company and Role are required' });
    }

    const application = await Application.create({
      userId: req.user._id,
      company,
      role,
      status: status || 'Wishlist',
      notes: notes || '',
      appliedDate: appliedDate ? new Date(appliedDate) : undefined
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/applications/:id
// @desc    Update a job application details or column status
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { company, role, status, notes, appliedDate } = req.body;

  try {
    let application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify application card belongs to the authenticated user
    if (application.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Update details dynamically
    application.company = company || application.company;
    application.role = role || application.role;
    application.status = status || application.status;
    application.notes = notes !== undefined ? notes : application.notes;
    if (appliedDate !== undefined) {
      application.appliedDate = appliedDate ? new Date(appliedDate) : undefined;
    }

    const updatedApplication = await application.save();
    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/applications/:id
// @desc    Delete a job application from tracker
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify application card belongs to the authenticated user
    if (application.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await application.deleteOne();
    res.json({ message: 'Application removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
