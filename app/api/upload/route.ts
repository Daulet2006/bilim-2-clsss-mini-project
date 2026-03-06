import { NextResponse } from "next/server"
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary"

export const runtime = "nodejs"

const MAX_FILE_SIZE = 10 * 1024 * 1024

let isCloudinaryConfigured = false

function ensureCloudinaryConfig() {
  if (isCloudinaryConfigured) return

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are missing")
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })

  isCloudinaryConfigured = true
}

function uploadImageBuffer(buffer: Buffer): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "bilim", resource_type: "image" },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }

        if (!result) {
          reject(new Error("Cloudinary upload failed"))
          return
        }

        resolve(result)
      }
    )

    stream.on("error", reject)
    stream.end(buffer)
  })
}

export async function POST(request: Request) {
  try {
    ensureCloudinaryConfig()

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File missing" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images allowed" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Max 10MB" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadImageBuffer(buffer)

    return NextResponse.json({ url: result.secure_url })
  } catch (error) {
    console.error("Upload failed:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
