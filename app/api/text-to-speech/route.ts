import { type NextRequest, NextResponse } from "next/server"

const MURF_API_KEY = "ap2_bae3187a-555b-4991-bd23-b9eb5086f452"
const MURF_API_URL = "https://global.api.murf.ai/v1/speech/stream"

// Language to voice mapping
const VOICE_MAP: Record<string, string> = {
  en: "en-US-matthew",
  hi: "hi-IN-madhur",
  bn: "bn-IN-basudha",
  te: "te-IN-shreya",
  ta: "ta-IN-venba",
  mr: "mr-IN-aarohi",
  gu: "gu-IN-sonal",
  kn: "kn-IN-kavya",
  ml: "ml-IN-midhun",
  pa: "pa-IN-amoli",
  ur: "ur-IN-salman",
}

export async function POST(request: NextRequest) {
  try {
    const { text, language } = await request.json()

    const voiceId = VOICE_MAP[language] || "en-US-matthew"

    const response = await fetch(MURF_API_URL, {
      method: "POST",
      headers: {
        "api-key": MURF_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voice_id: voiceId,
        text,
        multi_native_locale: language === "en" ? "en-US" : `${language}-IN`,
        model: "FALCON",
        format: "MP3",
        sampleRate: 24000,
        channelType: "MONO",
      }),
    })

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`)
    }

    const audioBuffer = await response.arrayBuffer()
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })
  } catch (error) {
    console.error("TTS error:", error)
    return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 })
  }
}
