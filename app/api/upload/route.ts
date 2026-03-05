import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import fs from "fs/promises"
import path from "path"

const HAS_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public/images/uploads")

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

const mimeToExt: Record<string,string> = {
  "image/jpeg":"jpg",
  "image/png":"png",
  "image/webp":"webp",
  "image/gif":"gif"
}

export async function POST(request: Request) {

  const formData = await request.formData()
  const file = formData.get("file") as File

  if(!file){
    return NextResponse.json({error:"File missing"},{status:400})
  }

  if(!file.type.startsWith("image/")){
    return NextResponse.json({error:"Only images allowed"},{status:400})
  }

  if(file.size > MAX_FILE_SIZE_BYTES){
    return NextResponse.json({error:"Max 10MB"},{status:400})
  }

  const ext = mimeToExt[file.type] || "jpg"

  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`

  if(HAS_BLOB){

    const blob = await put(`images/${fileName}`,file,{
      access:"public"
    })

    return NextResponse.json({url:blob.url})
  }

  await fs.mkdir(LOCAL_UPLOAD_DIR,{recursive:true})

  const buffer = Buffer.from(await file.arrayBuffer())

  const filePath = path.join(LOCAL_UPLOAD_DIR,fileName)

  await fs.writeFile(filePath,buffer)

  return NextResponse.json({
    url:`/images/uploads/${fileName}`
  })
}