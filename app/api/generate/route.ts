import { NextResponse } from "next/server"

async function generateWithStabilityAI(prompt: string) {
  if (!process.env.STABILITY_API_KEY) {
    throw new Error("STABILITY_API_KEY is not configured")
  }

  try {
    const response = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1,
          },
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        steps: 30,
        samples: 1,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(`Stability AI API error: ${error.message}`)
    }

    const result = await response.json()
    return result.artifacts[0].base64
  } catch (error) {
    console.error("Stability AI API error:", error)
    throw error
  }
}

export async function POST(req: Request) {
  try {
    const { city, issue } = await req.json()

    if (!city || !issue) {
      return NextResponse.json({ error: "City and issue are required" }, { status: 400 })
    }

    const prompt = `Create a powerful and emotional climate change awareness image depicting the impact of ${issue} in ${city}. Show realistic consequences and environmental effects, focusing on human impact and urgency for action. Style: photorealistic, dramatic lighting, emotional impact`

    // Generate image using Stability AI
    const stabilityImage = await generateWithStabilityAI(prompt)

    // For now, we'll use the Stability AI image and placeholders for others
    // In production, you would integrate with other providers
    const images = [
      {
        url: `data:image/png;base64,${stabilityImage}`,
        provider: "Stability AI",
      },
      {
        url: "/placeholder.svg?height=1024&width=1024",
        provider: "Alternative 1",
      },
      {
        url: "/placeholder.svg?height=1024&width=1024",
        provider: "Alternative 2",
      },
    ]

    return NextResponse.json({ images })
  } catch (error) {
    console.error("Error generating images:", error)
    return NextResponse.json({ error: "Failed to generate images" }, { status: 500 })
  }
}

