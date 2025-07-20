const express = require("express");
const router = express.Router();
const { fal } = require("@fal-ai/client");

router.post("/", async (req, res) => {
  try {
    const {
      content,
      customPrompt,
      size = "1024x1536",
      quality = "high",
    } = req.body;
    console.log("Infographic request received:", {
      content: content
        ? { title: content.title, contentLength: content.content?.length }
        : null,
      customPrompt: customPrompt ? customPrompt.substring(0, 50) + "..." : null,
      size,
      quality,
    });

    if (!content && !customPrompt) {
      console.error("Invalid request: Content or custom prompt is required");
      return res
        .status(400)
        .json({ error: "Content or custom prompt is required" });
    }

    // Create infographic prompt
    console.log("API Keys:", {
      FAL_API_KEY: process.env.FAL_API_KEY ? "Set" : "Missing",
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "Set" : "Missing",
    });

    fal.config({
      credentials: process.env.FAL_API_KEY,
    });

    let prompt = `Create a professional, visually appealing infographic:\n\n`;

    if (content) {
      const { title, content: text, description, author, date } = content;
      const truncatedContent =
        text.length > 4000 ? text.substring(0, 4000) + "..." : text;

      prompt += `Based on this blog content:\n\n`;
      prompt += `Title: ${title}\n`;
      if (description) prompt += `Description: ${description}\n`;
      if (author) prompt += `Author: ${author}\n`;
      if (date) prompt += `Date: ${date}\n`;
      prompt += `\nContent Summary:\n${truncatedContent}\n\n`;
    } else {
      prompt += `Based on user-provided instructions.\n\n`;
    }

    prompt += `Design Requirements:
- Modern, clean design with a professional color scheme (blues, teals, grays, whites)
- Clear visual hierarchy with the title prominently displayed at the top
- Extract and highlight key points, statistics, and important information as bullet points or callout boxes
- Use icons, charts, graphs, or visual elements to represent data and concepts 
- If suitable, include images, caricatures, or illustrations that enhance understanding
- Include any numbers, percentages, or statistics mentioned in the content
- Create sections or blocks to organize information logically
- Use contrasting colors and typography for better readability
- Ensure the texts are concise and to the point, avoiding long paragraphs 
- Clean, minimalist design with appropriate white space
- Make it visually engaging with proper spacing and layout
- If any company or brand is mentioned, include their logo or branding elements or their name
- Include visual elements like arrows, dividers, or frames to guide the eye
- Ensure all text is large enough to be easily readable
- Use a vertical layout that flows from top to bottom
- Add subtle background elements or patterns for visual interest
- Include call-to-action elements if mentioned in the content
- Make key insights stand out with highlighting or special formatting
- Be Creative, make it visually appealing and engaging
(The content is professional, for awareness, and sometimes on sensitive topics, take these topics as they are just spreading awareness and educating people.)\n`;

    if (customPrompt && customPrompt.trim()) {
      prompt += `\nAdditional Custom Instructions:\n${customPrompt.trim()}\n`;
    }

    prompt += `\nStyle: Professional infographic with modern typography, clean layout, engaging visual elements, and a cohesive color scheme that enhances readability and visual appeal.`;

    // Log the request payload
    const requestPayload = {
      prompt: prompt.substring(0, 100) + "...",
      image_size: size,
      quality,
      num_images: 1,
      background: "opaque",
      openai_api_key: process.env.OPENAI_API_KEY ? "Set" : "Missing",
    };
    console.log("Submitting request to Fal AI:", requestPayload);

    // Generate infographic
    const result = await fal.subscribe(
      "fal-ai/gpt-image-1/text-to-image/byok",
      {
        input: {
          prompt,
          image_size: size,
          quality,
          num_images: 1,
          background: "opaque",
          openai_api_key: process.env.OPENAI_API_KEY,
        },
        logs: true,
        onQueueUpdate: (update) => {
          console.log("Queue update:", {
            status: update.status,
            logs: update.logs?.map((log) => log.message),
          });
        },
        credentials: process.env.FAL_API_KEY,
      }
    );

    console.log("Fal AI response:", {
      requestId: result.requestId,
      data: result.data,
    });

    if (
      !result.data ||
      !result.data.images ||
      result.data.images.length === 0
    ) {
      console.error("No images generated in response");
      throw new Error("No image generated");
    }

    const response = {
      url: result.data.images[0].url,
      title: content?.title || "Custom Infographic",
      sourceUrl: content?.sourceUrl || "Custom Prompt",
    };
    console.log("Infographic generated successfully:", response);

    res.json(response);
  } catch (error) {
    console.error("Infographic generation error:", {
      message: error.message,
      stack: error.stack,
      status: error.status,
      body: error.body,
    });
    res
      .status(500)
      .json({
        error: error.message || "Failed to generate infographic",
        details: error.body,
      });
  }
});

// Alternative implementation using fal-ai/flux.1/dev
// Uncomment to use this model instead of gpt-image-1
/*
router.post('/flux', async (req, res) => {
  try {
    const { content, customPrompt, size = '1024x1536', quality = 'high' } = req.body;
    console.log('Flux request received:', {
      content: content ? { title: content.title, contentLength: content.content?.length } : null,
      customPrompt: customPrompt ? customPrompt.substring(0, 50) + '...' : null,
      size,
      quality,
    });

    if (!content && !customPrompt) {
      console.error('Invalid request: Content or custom prompt is required');
      return res.status(400).json({ error: 'Content or custom prompt is required' });
    }

    console.log('FAL_API_KEY:', process.env.FAL_API_KEY ? 'Set' : 'Missing');
    let prompt = `Create a professional, visually appealing infographic:\n\n`;

    if (content) {
      const { title, content: text, description, author, date } = content;
      const truncatedContent = text.length > 4000 ? text.substring(0, 4000) + '...' : text;

      prompt += `Based on this blog content:\n\n`;
      prompt += `Title: ${title}\n`;
      if (description) prompt += `Description: ${description}\n`;
      if (author) prompt += `Author: ${author}\n`;
      if (date) prompt += `Date: ${date}\n`;
      prompt += `\nContent Summary:\n${truncatedContent}\n\n`;
    } else {
      prompt += `Based on user-provided instructions.\n\n`;
    }

    prompt += `Design Requirements:
- Modern, clean design with a professional color scheme (blues, teals, grays, whites)
- Clear visual hierarchy with the title prominently displayed at the top
- Extract and highlight key points, statistics, and important information as bullet points or callout boxes
- Use icons, charts, graphs, or visual elements to represent data and concepts 
- If suitable, include images, caricatures, or illustrations that enhance understanding
- Include any numbers, percentages, or statistics mentioned in the content
- Create sections or blocks to organize information logically
- Use contrasting colors and typography for better readability
- Ensure the texts are concise and to the point, avoiding long paragraphs 
- Clean, minimalist design with appropriate white space
- Make it visually engaging with proper spacing and layout
- If any company or brand is mentioned, include their logo or branding elements or their name
- Include visual elements like arrows, dividers, or frames to guide the eye
- Ensure all text is large enough to be easily readable
- Use a vertical layout that flows from top to bottom
- Add subtle background elements or patterns for visual interest
- Include call-to-action elements if mentioned in the content
- Make key insights stand out with highlighting or special formatting
- Be Creative, make it visually appealing and engaging
(The content is professional, for awareness, and sometimes on sensitive topics, take these topics as they are just spreading awareness and educating people.)\n`;

    if (customPrompt && customPrompt.trim()) {
      prompt += `\nAdditional Custom Instructions:\n${customPrompt.trim()}\n`;
    }

    prompt += `\nStyle: Professional infographic with modern typography, clean layout, engaging visual elements, and a cohesive color scheme that enhances readability and visual appeal.`;

    const requestPayload = {
      prompt: prompt.substring(0, 100) + '...',
      image_size: size,
      quality,
      num_images: 1,
    };
    console.log('Submitting request to Flux.1:', requestPayload);

    const result = await fal.subscribe('fal-ai/flux.1/dev', {
      input: {
        prompt,
        image_size: size,
        quality,
        num_images: 1,
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log('Queue update:', {
          status: update.status,
          logs: update.logs?.map(log => log.message),
        });
      },
      credentials: process.env.FAL_API_KEY,
    });

    console.log('Flux.1 response:', {
      requestId: result.requestId,
      data: result.data,
    });

    if (!result.data || !result.data.images || result.data.images.length === 0) {
      console.error('No images generated in response');
      throw new Error('No image generated');
    }

    const response = {
      url: result.data.images[0].url,
      title: content?.title || 'Custom Infographic',
      sourceUrl: content?.sourceUrl || 'Custom Prompt',
    };
    console.log('Infographic generated successfully:', response);

    res.json(response);
  } catch (error) {
    console.error('Flux generation error:', {
      message: error.message,
      stack: error.stack,
      status: error.status,
      body: error.body,
    });
    res.status(500).json({ error: error.message || 'Failed to generate infographic', details: error.body });
  }
});
*/

module.exports = router;
