const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  jobTitle: {
    type: String,
    required: [true, 'Please add a job title']
  },
  jobDescriptionText: {
    type: String,
    required: [true, 'Please add the job description text']
  },
  atsScore: {
    type: Number,
    required: true
  },
  analysisData: {
    keywordAnalysis: {
      matchingKeywords: [String],
      missingKeywords: [String]
    },
    feedback: {
      formatting: [String],
      impactVerbs: [String],
      skillsImprovement: [String]
    },
    suggestedRewrites: [
      {
        originalText: String,
        suggestedText: String,
        reasoning: String
      }
    ]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Analysis', AnalysisSchema);
