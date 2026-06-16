const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment configuration variables from .env file
dotenv.config();

// Establish connection to MongoDB database
connectDB();

const app = express();

// Enable Cross-Origin Resource Sharing (allows frontend at port 5173 to call backend at 5000)
app.use(cors());

// Enable middleware to parse incoming JSON request payloads
app.use(express.json());

// Mount API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/analysis', require('./routes/analysis'));
app.use('/api/applications', require('./routes/applications'));

// Test Route to ensure backend is running successfully
app.get('/', (req, res) => {
  res.send('AI Resume Analyzer API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running in development mode on port ${PORT}`);
});
