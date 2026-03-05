// app/api/upload/route.ts
import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const UPLOAD_DIR = path.join(process.cwd(), "public/images/uploads")
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(request: Request) {

  const formData = await request.formData()
  const file = formData.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "File missing" }, { status: 400 })
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only images allowed" }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Max 10MB" }, { status: 400 })
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  const fileName = `${Date.now()}-${file.name}`

  const filePath = path.join(UPLOAD_DIR, fileName)

  await fs.writeFile(filePath, buffer)

  return NextResponse.json({
    url: `/images/uploads/${fileName}`
  })
}