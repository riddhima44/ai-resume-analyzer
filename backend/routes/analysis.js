const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth');
const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');
const CoverLetter = require('../models/CoverLetter');

// Configure Multer to store uploaded files in memory temporary storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    // Only accept PDF and DOCX file types
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed!'), false);
    }
  }
});

// Robust JSON parser helper for Gemini responses (handles invalid backslash escapes like \[ or \])
const parseRobustJson = (text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    // Replace invalid JSON escape characters (anything not followed by n, r, t, b, f, ", \, /, u)
    const cleaned = text.replace(/\\([^nrtbf"\\/u])/g, '$1');
    try {
      return JSON.parse(cleaned);
    } catch (innerError) {
      // Fallback: extract the content field directly using regex if parsing still fails
      const match = text.match(/"content"\s*:\s*"([\s\S]*?)"\s*\}/);
      if (match && match[1]) {
        const extracted = match[1]
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\/g, '');
        return { content: extracted };
      }
      throw error; // throw original parsing error
    }
  }
};

// @route   POST /api/analysis/upload
// @desc    Upload resume PDF/DOCX and parse text in-memory
// @access  Private
router.post('/upload', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let extractedText = '';

    // Parse text based on document type
    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = pdfData.text;
    } else {
      const docxData = await mammoth.extractRawText({ buffer: req.file.buffer });
      extractedText = docxData.value;
    }

    // Validate if text extraction succeeded
    if (!extractedText.trim()) {
      return res.status(400).json({
        message: 'Could not extract text. Please ensure the document is not an image scan.'
      });
    }

    // Save resume meta and text in database
    const resume = await Resume.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      rawText: extractedText
    });

    res.status(201).json({
      message: 'Resume uploaded and parsed successfully',
      resumeId: resume._id,
      fileName: resume.fileName,
      extractedText: resume.rawText
    });
  } catch (error) {
    console.error('File Upload/Parse Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/analysis/analyze
// @desc    Run ATS optimization review on resume and job description using Gemini
// @access  Private
router.post('/analyze', protect, async (req, res) => {
  const { resumeId, jobTitle, jobDescriptionText } = req.body;

  try {
    if (!resumeId || !jobTitle || !jobDescriptionText) {
      return res.status(400).json({
        message: 'Please provide resumeId, jobTitle, and jobDescriptionText'
      });
    }

    // Retrieve resume from database
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Initialize the Google Gemini API client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Construct detailed prompt instructing structured JSON output
    const prompt = `You are an expert recruiter and Applicant Tracking System (ATS) optimization engine.
Analyze the following Resume and Job Description.

Resume Text:
"""
${resume.rawText}
"""

Job Description:
"""
${jobDescriptionText}
"""

Perform a deep analysis and output a single valid JSON object matching this schema exactly:
{
  "atsScore": number (an integer from 0 to 100 representing compatibility score based on skills, experience and alignment),
  "keywordAnalysis": {
    "matchingKeywords": [list of string skills, technologies, or keywords present in both the resume and the JD],
    "missingKeywords": [list of string skills, technologies, or keywords required by the JD but missing or weak in the resume]
  },
  "feedback": {
    "formatting": [list of actionable tips regarding layout, section order, readability, etc.],
    "impactVerbs": [list of specific phrasing suggestions to replace passive verbs with metrics and impact verbs],
    "skillsImprovement": [list of specific certifications, projects, or technical skills the candidate should add]
  },
  "suggestedRewrites": [
    {
      "originalText": "exact text snippet from the resume that is weak or lacks impact",
      "suggestedText": "rewritten version showcasing specific accomplishments, metrics, or action verbs",
      "reasoning": "explanation of why this modification improves the resume"
    }
  ]
}`;

    // Call Gemini API and request JSON formatting
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.response.text();
    const parsedData = parseRobustJson(responseText);

    // Save final analysis report
    const analysis = await Analysis.create({
      userId: req.user._id,
      resumeId: resume._id,
      jobTitle,
      jobDescriptionText,
      atsScore: parsedData.atsScore,
      analysisData: parsedData
    });

    res.status(201).json(analysis);
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    res.status(500).json({
      message: 'Error processing AI analysis',
      error: error.message
    });
  }
});

// @route   POST /api/analysis/cover-letter
// @desc    Generate a custom cover letter based on resume and JD
// @access  Private
router.post('/cover-letter', protect, async (req, res) => {
  const { resumeId, jobTitle, company, jobDescriptionText } = req.body;

  try {
    if (!resumeId || !jobTitle || !jobDescriptionText) {
      return res.status(400).json({
        message: 'Please provide resumeId, jobTitle, and jobDescriptionText'
      });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a professional resume writer and career coach.
Write a highly customized, compelling cover letter for the applicant applying to the job role.

Applicant's Resume Details:
"""
${resume.rawText}
"""

Target Job:
Role: ${jobTitle}
Company: ${company || 'the target company'}
Job Description:
"""
${jobDescriptionText}
"""

Instructions:
1. Ensure the cover letter is written in a professional, engaging tone.
2. Structure it with a header placeholder, an engaging introduction, a body emphasizing relevant experiences/projects matching the JD, and a strong call-to-action conclusion.
3. Keep it to roughly 300-400 words.
4. Output your response as a single valid JSON object matching this schema exactly:
{
  "content": "The full text of the cover letter with newlines represented as \\n characters."
}`;

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.response.text();
    const parsedData = parseRobustJson(responseText);

    // Save generated cover letter
    const coverLetter = await CoverLetter.create({
      userId: req.user._id,
      resumeId: resume._id,
      jobTitle,
      company: company || '',
      content: parsedData.content
    });

    res.status(201).json(coverLetter);
  } catch (error) {
    console.error('Gemini Cover Letter Error:', error);
    res.status(500).json({
      message: 'Error generating cover letter',
      error: error.message
    });
  }
});

// @route   GET /api/analysis/history
// @desc    Get user's past analysis history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const history = await Analysis.find({ userId: req.user._id })
      .populate('resumeId', 'fileName')
      .sort({ createdAt: -1 }); // Newest report first
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analysis/:id
// @desc    Get a single analysis report by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id)
      .populate('resumeId', 'fileName');

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis report not found' });
    }

    // Verify report belongs to the authenticated user
    if (analysis.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Fetch Analysis Error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
