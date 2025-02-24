"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, Facebook, Instagram, Twitter } from 'lucide-react'
import Image from "next/image"

const climateIssues = {
  "New York": ["Sea Level Rise", "Urban Heat Island", "Air Pollution"],
  London: ["Flooding", "Air Quality", "Heat Waves"],
  Tokyo: ["Typhoons", "Urban Flooding", "Heat Stress"],
  Mumbai: ["Monsoon Flooding", "Coastal Erosion", "Air Pollution"],
}

interface GeneratedImage {
  url: string
  provider: string
  error?: string
}

export default function Home() {
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedIssue, setSelectedIssue] = useState("")
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateImages = async () => {
    setIsLoading(true)
    setGeneratedImages([])
    setError(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city: selectedCity,
          issue: selectedIssue,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate images")
      }

      const data = await response.json()
      setGeneratedImages(data.images)
    } catch (error) {
      console.error("Error generating images:", error)
      setError(error instanceof Error ? error.message : "Failed to generate images")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (imageUrl: string) => {
    if (imageUrl.includes("placeholder.svg")) {
      console.error("Cannot download placeholder image")
      return
    }

    try {
      // For base64 images
      if (imageUrl.startsWith("data:image")) {
        const link = document.createElement("a")
        link.href = imageUrl
        link.download = `climate-awareness-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // For regular URLs
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `climate-awareness-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error("Error downloading image:", error)
    }
  }

  const handleShare = (platform: string, imageUrl: string) => {
    if (imageUrl.includes("placeholder.svg")) {
      console.error("Cannot share placeholder image")
      return
    }

    const text = `Check out this climate change awareness image for ${selectedCity}'s ${selectedIssue} issue!`
    const url = encodeURIComponent(window.location.href)

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      instagram: `https://instagram.com`,
    }

    window.open(shareUrls[platform as keyof typeof shareUrls], "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4">
      <Card className="max-w-md mx-auto bg-white/80 backdrop-blur">
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-center text-green-800 mb-6">GreenGlitch</h1>

          <div className="space-y-4">
            <Select
              onValueChange={(value) => {
                setSelectedCity(value)
                setSelectedIssue("")
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(climateIssues).map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedIssue} disabled={!selectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Select climate issue" />
              </SelectTrigger>
              <SelectContent>
                {selectedCity &&
                  climateIssues[selectedCity as keyof typeof climateIssues].map((issue) => (
                    <SelectItem key={issue} value={issue}>
                      {issue}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={handleGenerateImages}
              disabled={!selectedCity || !selectedIssue || isLoading}
            >
              {isLoading ? "Generating..." : "Generate Awareness Images"}
            </Button>

            {error && (
              <div className="p-4 text-sm text-red-800 bg-red-100 rounded-lg">
                {error}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {isLoading ? (
              Array(3)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="w-full h-[300px] rounded-lg" />)
            ) : (
              generatedImages.map((image, index) => (
                <div key={index} className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden">
                    <Image
                      src={image.url || "/placeholder.svg"}
                      alt={`Climate awareness image by ${image.provider}`}
                      width={1024}
                      height={1024}
                      className="w-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      {image.provider}
                    </div>
                    {image.error && (
                      <div className="absolute bottom-2 right-2 bg-red-500/50 text-white px-2 py-1 rounded text-sm">
                        {image.error}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownload(image.url)}
                      disabled={image.url.includes("placeholder.svg")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare("twitter", image.url)}
                      disabled={image.url.includes("placeholder.svg")}
                    >
                      <Twitter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare("facebook", image.url)}
                      disabled={image.url.includes("placeholder.svg")}
                    >
                      <Facebook className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare("instagram", image.url)}
                      disabled={image.url.includes("placeholder.svg")}
                    >
                      <Instagram className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
