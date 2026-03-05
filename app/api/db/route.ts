import { NextResponse } from "next/server"
import { put, list } from "@vercel/blob"
import fs from "fs/promises"
import path from "path"

const DB_BLOB_PREFIX = "bilim-db"
const DB_FILE_PATH = path.join(process.cwd(), "data", "db.json")
const HAS_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

function getFallbackDb() {
  return { topics: [], blog: [] }
}

async function getDbFromBlob(): Promise<Record<string, unknown> | null> {
  try {
    const { blobs } = await list({ prefix: DB_BLOB_PREFIX, limit: 1 })
    if (blobs.length > 0 && blobs[0].url) {
      const res = await fetch(blobs[0].url, { cache: "no-store" })
      if (res.ok) {
        return await res.json()
      }
    }
    return null
  } catch {
    return null
  }
}

async function getDbFromFile(): Promise<Record<string, unknown>> {
  try {
    const data = await fs.readFile(DB_FILE_PATH, "utf-8")
    return JSON.parse(data)
  } catch {
    return getFallbackDb()
  }
}

async function saveToFile(data: Record<string, unknown>) {
  await fs.mkdir(path.dirname(DB_FILE_PATH), { recursive: true })
  await fs.writeFile(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8")
}

async function saveToBlob(data: Record<string, unknown>) {
  await put(`${DB_BLOB_PREFIX}.json`, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  })
}

export async function GET() {
  try {
    if (HAS_BLOB) {
      const blobData = await getDbFromBlob()
      if (blobData) {
        return NextResponse.json(blobData)
      }

      const fileData = await getDbFromFile()
      try {
        await saveToBlob(fileData)
      } catch {
        // Ignore blob write errors during local dev without token
      }
      return NextResponse.json(fileData)
    }

    const fileData = await getDbFromFile()
    return NextResponse.json(fileData)
  } catch {
    return NextResponse.json(getFallbackDb())
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()

    if (HAS_BLOB) {
      await saveToBlob(data)
    } else {
      await saveToFile(data)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DB save error:", error)
    return NextResponse.json(
      { error: "Failed to save data" },
      { status: 500 }
    )
  }
}
