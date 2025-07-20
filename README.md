

# Infographics AI

A tool that turns any blog or text into an infographic using AI.

## Tech Stack

- **Frontend:** React + TypeScript (with Adobe Spectrum Web Components)
- **Backend:** Node.js + Express (deployed on Render)
- **AI:** Fal AI (for image generation)
- **Web Scraping:** Axios and JSDOM
- **Integration:** Adobe Express Add-on

## How It Works

1. User enters a blog URL or custom prompt.
2. Backend scrapes the blog content.
3. Sends the prompt to Fal AI to generate an infographic image.
4. User can add the image directly to their Adobe Express canvas.

## Local Setup

### Frontend

```bash
cd /path/to/Infographics-AI---Adobe
npm install
npm start
```

### Backend

```bash
cd backend
npm install
# Create a .env file and add your FAL_API_KEY
npm start
```

## Usage

- Open the frontend, enter a blog link or custom prompt.
- Click generate infographic.
- Download or add the image to Adobe Express.

## Deployment

- Backend can be deployed on Render.
- Frontend can be deployed on any static hosting.

## .env Example (Backend)

Create a `.env` file in the `backend` folder like this:

```
FAL_API_KEY=your_fal_api_key_here
```

## License

MIT