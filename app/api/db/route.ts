// app/api/db/route.ts
import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const DB_FILE = path.join(process.cwd(), "data/db.json")

function getFallbackDb() {
  return { topics: [] }
}

export async function GET() {

  try {
    const data = await fs.readFile(DB_FILE, "utf-8")
    return NextResponse.json(JSON.parse(data))
  } catch {
    return NextResponse.json(getFallbackDb())
  }

}

export async function PUT(request: Request) {

  try {

    const data = await request.json()

    await fs.writeFile(
      DB_FILE,
      JSON.stringify(data, null, 2),
      "utf-8"
    )

    return NextResponse.json({ success: true })

  } catch {

    return NextResponse.json(
      { error: "Failed to save DB" },
      { status: 500 }
    )

  }

}