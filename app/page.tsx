"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Skeleton } from "../components/ui/skeleton"
import { Download, Facebook, Instagram, Twitter } from "lucide-react"
import Image from "next/image"
//import { toast } from "../components/ui/use-toast"

// Mock climate issues data - in production this would come from an API
const climateIssues = {
  "New York": ["Sea Level Rise", "Urban Heat Island", "Air Pollution"],
  London: ["Flooding", "Air Quality", "Heat Waves"],
  Tokyo: ["Typhoons", "Urban Flooding", "Heat Stress"],
  Mumbai: ["Monsoon Flooding", "Coastal Erosion", "Air Pollution"],
  // Add more cities and their issues
}

export default function GreenGitch() {
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedIssue, setSelectedIssue] = useState("")
  const [generatedImages, setGeneratedImages] = useState<Array<{ url: string; provider: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateImages = async () => {
    setIsLoading(true)
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
      /*toast({
        title: "Error",
        description: "Failed to generate images. Please try again.",
        variant: "destructive",
      })*/
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `climate-awareness-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading image:", error)
    }
  }

  const handleShare = (platform: string, imageUrl: string) => {
    const text = `Check out this climate change awareness image for ${selectedCity}'s ${selectedIssue} issue!`
    const url = encodeURIComponent(window.location.href)

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      instagram: `https://instagram.com`, // Note: Instagram doesn't support direct sharing via URL
    }

    window.open(shareUrls[platform as keyof typeof shareUrls], "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4">
      <Card className="max-w-md mx-auto bg-white/80 backdrop-blur">
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-center text-green-800 mb-6">GreenGitch</h1>

          <div className="space-y-4">
            <Select onValueChange={setSelectedCity}>
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
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleGenerateImages}
              disabled={!selectedCity || !selectedIssue}
            >
              Generate Awareness Images
            </Button>
          </div>

          <div className="space-y-6">
            {isLoading
              ? Array(3)
                  .fill(0)
                  .map((_, i) => <Skeleton key={i} className="w-full h-[300px] rounded-lg" />)
              : generatedImages.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden">
                      <Image
                        src={image.url || "/placeholder.svg"}
                        alt={`Climate awareness image ${index + 1}`}
                        width={400}
                        height={300}
                        className="w-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                        {image.provider}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload(image.url)}>
                        <Download className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleShare("twitter", image.url)}>
                        <Twitter className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleShare("facebook", image.url)}>
                        <Facebook className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleShare("instagram", image.url)}>
                        <Instagram className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

