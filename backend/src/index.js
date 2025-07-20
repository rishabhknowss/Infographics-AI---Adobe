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
  origin: ['https://localhost:5241', 'https://new.express.adobe.com/' , 'https://w513kh8ki.wxp.adobe-addons.com/'], // Update with your Adobe Express add-on domain
  methods: ['GET', 'POST'],
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