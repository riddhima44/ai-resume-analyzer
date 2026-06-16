const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: [true, 'Please add a company name']
  },
  role: {
    type: String,
    required: [true, 'Please add a job role']
  },
  status: {
    type: String,
    enum: ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'],
    default: 'Wishlist'
  },
  notes: {
    type: String,
    default: ''
  },
  appliedDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Application', ApplicationSchema);
