const express = require('express');
const router = express.Router();
const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    console.log('Scrape request received:', { url });

    if (!url) {
      console.error('Scrape error: URL is required');
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    console.log('Validating URL:', url);
    let validatedUrl;
    try {
      validatedUrl = new URL(url);
      if (validatedUrl.protocol !== 'http:' && validatedUrl.protocol !== 'https:') {
        throw new Error('Invalid URL protocol');
      }
    } catch (error) {
      console.error('URL validation error:', error.message);
      return res.status(400).json({ error: 'Invalid URL', details: error.message });
    }

    // Fetch content
    console.log('Fetching content from:', url);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    console.log('Received response:', {
      status: response.status,
      contentType: response.headers['content-type'],
    });

    if (!response.headers['content-type'].includes('text/html')) {
      console.error('Invalid content type:', response.headers['content-type']);
      return res.status(400).json({ error: 'The URL does not point to a valid HTML page' });
    }

    const dom = new JSDOM(response.data);
    const doc = dom.window.document;

    // Extract information
    console.log('Extracting content...');
    const title = doc.querySelector('title')?.textContent?.trim() || 
                  doc.querySelector('h1')?.textContent?.trim() || '';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                       doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    const datePublished = doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
                         doc.querySelector('time')?.getAttribute('datetime') || '';
    const author = doc.querySelector('meta[name="author"]')?.getAttribute('content') ||
                   doc.querySelector('meta[property="article:author"]')?.getAttribute('content') ||
                   doc.querySelector('.author')?.textContent?.trim() || '';

    // Remove unwanted elements
    const unwantedSelectors = [
      'script', 'style', 'noscript', 'iframe', 'nav', 'header', 'footer',
      'aside', '.sidebar', '.nav', '.menu', '.comments', '.ad', '.advertisement', 'form'
    ];
    console.log('Removing unwanted elements:', unwantedSelectors);
    unwantedSelectors.forEach(selector => {
      doc.querySelectorAll(selector).forEach(el => el.remove());
    });

    // Extract main content
    let mainContent = '';
    const contentSelectors = [
      'article', '.post-content', '.article-content', '.entry-content',
      '.content', 'main', '#content', '.post', '.article', '.blog-post',
      '.post-body', '.story-body', '.entry', '.single-post', '.blog-content',
      '.article-body', '.post-text', '.content-area', '.main-content',
      '[role="main"]', '.entry-summary', '.post-excerpt'
    ];

    console.log('Searching for main content with selectors:', contentSelectors);
    for (const selector of contentSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const selectedContent = element.textContent?.trim() || '';
        if (selectedContent && selectedContent.length > mainContent.length) {
          mainContent = selectedContent;
          console.log(`Selected content from selector: ${selector}`);
        }
      }
    }

    if (!mainContent) {
      mainContent = doc.body?.textContent?.trim() || '';
      console.log('Falling back to body content');
    }

    // Clean content
    console.log('Cleaning content...');
    mainContent = mainContent
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .replace(/[^\w\s.,?!;:()"'-]/g, ' ')
      .replace(/[.]{2,}/g, '...')
      .replace(/[!]{2,}/g, '!')
      .replace(/[?]{2,}/g, '?')
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/&[a-z]+;/g, ' ')
      .replace(/([.,!?;:])\s*([A-Za-z])/g, '$1 $2')
      .trim();

    if (!mainContent || mainContent.length < 100) {
      console.error('Insufficient content extracted:', mainContent.length);
      return res.status(400).json({ error: 'Unable to extract sufficient content from the URL' });
    }

    const result = {
      title,
      content: mainContent,
      description,
      author,
      date: datePublished,
    };
    console.log('Scrape result:', {
      title: result.title,
      contentLength: result.content.length,
      description: result.description,
      author: result.author,
      date: result.date,
    });

    res.json(result);
  } catch (error) {
    console.error('Scraping error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: error.message || 'Failed to scrape content' });
  }
});

module.exports = router;