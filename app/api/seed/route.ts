import { NextResponse } from "next/server"
import { put, list } from "@vercel/blob"
import fs from "fs/promises"
import path from "path"

const DB_BLOB_PREFIX = "bilim-db"
const HAS_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

export async function POST() {
  try {
    if (!HAS_BLOB) {
      return NextResponse.json({ message: "Blob token is not configured" }, { status: 400 })
    }

    // Check if blob already exists
    const { blobs } = await list({ prefix: DB_BLOB_PREFIX, limit: 1 })
    if (blobs.length > 0) {
      return NextResponse.json({ message: "Database already seeded" })
    }

    // Read from local file and push to blob
    const filePath = path.join(process.cwd(), "data", "db.json")
    const data = await fs.readFile(filePath, "utf-8")
    
    await put(`${DB_BLOB_PREFIX}.json`, data, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    })

    return NextResponse.json({ success: true, message: "Database seeded successfully" })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    )
  }
}
