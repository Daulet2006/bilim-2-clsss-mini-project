// app/api/seed/route.ts
import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const DB_FILE = path.join(process.cwd(), "data/db.json")

export async function POST() {

  try {

    const filePath = path.join(process.cwd(), "data/db.json")
    const data = await fs.readFile(filePath, "utf-8")

    await fs.writeFile(DB_FILE, data)

    return NextResponse.json({
      success: true,
      message: "Database seeded"
    })

  } catch {

    return NextResponse.json(
      { error: "Seed failed" },
      { status: 500 }
    )

  }

}