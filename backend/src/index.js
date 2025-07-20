const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const scrapeRouter = require('./routes/scrape');
const infographicRouter = require('./routes/infographic');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://localhost:5241',
      'https://new.express.adobe.com',
      'https://w513kh8ki.wxp.adobe-addons.com',
    ];

    // Allow requests with no origin (e.g., server-to-server or curl)
    if (!origin) return callback(null, true);

    // Check if the origin is in allowedOrigins or matches adobe-addons.com subdomains
    if (
      allowedOrigins.includes(origin) ||
      /^https:\/\/[a-z0-9-]+\.wxp\.adobe-addons\.com$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Optional: include if cookies or auth headers are needed
  optionsSuccessStatus: 204, // Ensure 204 status for preflight requests
}));
app.use(express.json());

// Routes
app.use('/api/scrape', scrapeRouter);
app.use('/api/generate-infographic', infographicRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});