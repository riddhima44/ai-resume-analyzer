const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const list = async () => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-2.5-flash',
      'gemini-2.0-flash-exp'
    ];
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const res = await model.generateContent("hi");
        console.log(`SUCCESS: Model "${m}" works! Output: ${res.response.text().trim()}`);
        return; // Stop if we find a working model
      } catch (err) {
        console.log(`Model "${m}" failed: ${err.message}`);
      }
    }
  } catch (error) {
    console.error("General Error:", error);
  }
};
list();
