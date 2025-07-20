"use client"

import React from "react"
import { useState } from "react"
import { Theme } from "@swc-react/theme"
import { Button } from "@swc-react/button"
import { Textfield } from "@swc-react/textfield"
import { Picker } from "@swc-react/picker"
import { MenuItem } from "@swc-react/menu"
import { FieldLabel } from "@swc-react/field-label"
import { ProgressCircle } from "@swc-react/progress-circle"
import "@spectrum-web-components/theme/express/scale-medium.js"
import "@spectrum-web-components/theme/express/theme-light.js"
import type { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js"
import "./App.css"

interface AppProps {
  addOnUISdk: AddOnSDKAPI
}

interface ScrapedContent {
  title: string
  content: string
  description?: string
  author?: string
  date?: string
}

interface GeneratedInfographic {
  url: string
  title: string
  sourceUrl: string
}

const App: React.FC<AppProps> = ({ addOnUISdk }) => {
  const [url, setUrl] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  // const [size, setSize] = useState("1024x1536")
  // const [quality, setQuality] = useState("high")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedInfographic, setGeneratedInfographic] = useState<GeneratedInfographic | null>(null)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState("")

  const API_BASE_URL ="https://infographics-ai-adobe.onrender.com"

  const generateInfographic = async () => {
    if (!url.trim() && !customPrompt.trim()) {
      setError("Please enter a blog URL or custom prompt")
      return
    }

    setIsGenerating(true)
    setError("")
    setGeneratedInfographic(null)

    try {
      let scrapedContent: ScrapedContent | undefined
      let infographicTitle = "Custom Infographic"
      let sourceUrl = url.trim()

      if (url.trim()) {
        setProgress("Scraping blog content...")
        const response = await fetch(`${API_BASE_URL}/api/scrape`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: url.trim() }),
        })

        if (!response.ok) {
          throw new Error(`Scraping failed: ${response.statusText}`)
        }

        scrapedContent = await response.json()
        if (!scrapedContent.content || scrapedContent.content.length < 100) {
          throw new Error("Unable to extract sufficient content from the URL")
        }
        infographicTitle = scrapedContent.title
      }

      setProgress("Generating infographic...")
      const response = await fetch(`${API_BASE_URL}/api/generate-infographic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: scrapedContent,
          customPrompt: customPrompt.trim(),
          size: "1024x1536",
          quality: "high",
        }),
      })

      if (!response.ok) {
        throw new Error(`Infographic generation failed: ${response.statusText}`)
      }

      const result = await response.json()
      setGeneratedInfographic({
        url: result.url,
        title: result.title,
        sourceUrl: result.sourceUrl,
      })

      setProgress("Infographic generated successfully!")
    } catch (error) {
      console.error("Error generating infographic:", error)
      setError(error instanceof Error ? error.message : "Failed to generate infographic")
    } finally {
      setIsGenerating(false)
      setTimeout(() => setProgress(""), 2000)
    }
  }

  const addToCanvas = async () => {
    if (!generatedInfographic) return

    try {
      setProgress("Adding to canvas...")
      const response = await fetch(generatedInfographic.url)
      const blob = await response.blob()
      await addOnUISdk.app.document.addImage(blob)
      setProgress("Image added to canvas successfully!")
      setTimeout(() => setProgress(""), 2000)
    } catch (error) {
      console.error("Error adding image to canvas:", error)
      setError("Failed to add image to canvas")
    }
  }

  const resetSettings = () => {
    setUrl("")
    setCustomPrompt("")
    // setSize("1024x1536")
    // setQuality("high")
    setGeneratedInfographic(null)
    setError("")
    setProgress("")
  }

  return (
    <Theme system="express" scale="medium" color="light">
      <div className="container">
        <div className="header">
          <h1>AI Infographic Generator</h1>
          <p>Transform blog posts or custom prompts into stunning infographics</p>
        </div>

        <div className="main-content">
          <div className="card">
            <h2>Blog URL</h2>
            <div className="control">
              <FieldLabel>Enter blog post URL</FieldLabel>
              <Textfield
                value={url}
                onInput={(e: any) => setUrl(e.target.value)}
                placeholder="https://example.com/blog-post"
                disabled={isGenerating}
              />
            </div>
          </div>

          <div className="card">
            <h2>Custom Instructions</h2>
            <div className="control">
              <FieldLabel>Add specific requirements for your infographic</FieldLabel>
              <Textfield
                value={customPrompt}
                onInput={(e: any) => setCustomPrompt(e.target.value)}
                placeholder="Example: Focus on statistics, use green colors, make it social media friendly..."
                disabled={isGenerating}
                rows={3}
              />
            </div>
          </div>

          {/* <div className="card">
            <h2>Settings</h2>
            <div className="control">
              <FieldLabel>Image Size</FieldLabel>
              <Picker
                value={size}
                change={(value: any) => setSize(value)}
                disabled={isGenerating}
              >
                <MenuItem value="1024x1536">Portrait (1024x1536)</MenuItem>
                <MenuItem value="1024x1024">Square (1024x1024)</MenuItem>
                <MenuItem value="1536x1024">Landscape (1536x1024)</MenuItem>
              </Picker>
            </div>
            <div className="control">
              <FieldLabel>Quality</FieldLabel>
              <Picker
                value={quality}
                change={(value: any) => setQuality(value)}
                disabled={isGenerating}
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Picker>
            </div>
          </div> */}

          {(progress || error) && (
            <div className="card status-card">
              {progress && (
                <div className="progress-section">
                  <ProgressCircle indeterminate size="s" />
                  <p className="progress-text">{progress}</p>
                </div>
              )}
              {error && (
                <div className="error-section">
                  <p className="error-text">{error}</p>
                </div>
              )}
            </div>
          )}

          {generatedInfographic && (
            <div className="card preview-card">
              <h2>Generated Infographic</h2>
              <div className="preview">
                <img
                  src={generatedInfographic.url || "/placeholder.svg"}
                  alt="Generated Infographic"
                  className="preview-image"
                />
              </div>
              <p className="preview-title">Based on: {generatedInfographic.title}</p>
            </div>
          )}

          <div className="card">
            <h2>Actions</h2>
            <div className="button-group">
              <Button
                size="m"
                variant="secondary"
                onClick={resetSettings}
                disabled={isGenerating}
              >
                Reset
              </Button>
              <Button
                size="m"
                onClick={generateInfographic}
                disabled={isGenerating || (!url.trim() && !customPrompt.trim())}
              >
                {isGenerating ? "Generating..." : "Generate Infographic"}
              </Button>
              {generatedInfographic && (
                <Button
                  size="m"
                  variant="cta"
                  onClick={addToCanvas}
                  disabled={isGenerating}
                >
                  Add to Canvas
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Theme>
  )
}

export default App