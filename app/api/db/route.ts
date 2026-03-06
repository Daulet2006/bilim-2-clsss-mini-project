import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const DB_FILE = path.join(process.cwd(), "data/db.json")

interface TaskData {
  type: string
  question: string
  options?: string[]
  correctAnswer?: number | boolean | string
  pairs?: { left: string; right: string }[]
}

interface LessonData {
  id: string
  title: string
  pages: { content: string; image?: string }[]
  tasks: TaskData[]
}

interface TopicData {
  id: string
  title: string
  description: string
  icon: string
  color: string
  image?: string
  lessons: LessonData[]
}

interface BlogPost {
  id: string
  title: string
  content: string
  date: string
  image?: string
}

interface DbData {
  topics: TopicData[]
  blog: BlogPost[]
}

const EMPTY_DB: DbData = { topics: [], blog: [] }

function asObject(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback
}

function sanitizeTask(task: unknown): TaskData | null {
  const input = asObject(task)
  if (!input) return null

  const normalizedType = asString(input.type, "multiple_choice")
  const type = ["multiple_choice", "true_false", "fill_blank", "match"].includes(normalizedType)
    ? normalizedType
    : "multiple_choice"
  const question = asString(input.question, "")

  if (type === "true_false") {
    return {
      type,
      question,
      correctAnswer: typeof input.correctAnswer === "boolean" ? input.correctAnswer : false,
    }
  }

  if (type === "fill_blank") {
    return {
      type,
      question,
      correctAnswer: asString(input.correctAnswer, ""),
    }
  }

  if (type === "match") {
    const pairs = Array.isArray(input.pairs)
      ? input.pairs
          .filter(Boolean)
          .map((pair) => {
            const pairInput = asObject(pair)
            if (!pairInput) return null
            return {
              left: asString(pairInput.left, ""),
              right: asString(pairInput.right, ""),
            }
          })
          .filter((pair): pair is { left: string; right: string } => pair !== null)
      : []

    return {
      type,
      question,
      pairs: pairs.length > 0 ? pairs : [{ left: "", right: "" }],
    }
  }

  const options = Array.isArray(input.options)
    ? input.options.map((option) => asString(option, ""))
    : ["", "", "", ""]

  if (options.length === 0) {
    options.push("", "", "", "")
  }

  const correctAnswer =
    typeof input.correctAnswer === "number" &&
    input.correctAnswer >= 0 &&
    input.correctAnswer < options.length
      ? input.correctAnswer
      : 0

  return {
    type: "multiple_choice",
    question,
    options,
    correctAnswer,
  }
}

function sanitizeLesson(lesson: unknown): LessonData | null {
  const input = asObject(lesson)
  if (!input) return null

  const pages = Array.isArray(input.pages)
    ? input.pages
        .filter(Boolean)
        .map((page) => {
          const pageInput = asObject(page)
          if (!pageInput) return null

          const image = asString(pageInput.image, "")

          return {
            content: asString(pageInput.content, ""),
            ...(image ? { image } : {}),
          }
        })
        .filter((page): page is { content: string; image?: string } => page !== null)
    : []

  const lessonDraft = {
    id: asString(input.id, ""),
    title: asString(input.title, ""),
    pages,
    tasks: Array.isArray(input.tasks) ? input.tasks : [],
  }

  lessonDraft.tasks = lessonDraft.tasks?.filter(Boolean) || []

  const tasks = lessonDraft.tasks
    .map((task) => sanitizeTask(task))
    .filter((task): task is TaskData => task !== null)

  return {
    id: lessonDraft.id,
    title: lessonDraft.title,
    pages: lessonDraft.pages,
    tasks,
  }
}

function sanitizeTopic(topic: unknown): TopicData | null {
  const input = asObject(topic)
  if (!input) return null

  const lessons = Array.isArray(input.lessons)
    ? input.lessons
        .filter(Boolean)
        .map((lesson) => sanitizeLesson(lesson))
        .filter((lesson): lesson is LessonData => lesson !== null)
    : []

  const image = asString(input.image, "")

  return {
    id: asString(input.id, ""),
    title: asString(input.title, ""),
    description: asString(input.description, ""),
    icon: asString(input.icon, ""),
    color: asString(input.color, "#4ECDC4"),
    ...(image ? { image } : {}),
    lessons,
  }
}

function sanitizeBlogPost(post: unknown): BlogPost | null {
  const input = asObject(post)
  if (!input) return null

  const image = asString(input.image, "")

  return {
    id: asString(input.id, ""),
    title: asString(input.title, ""),
    content: asString(input.content, ""),
    date: asString(input.date, ""),
    ...(image ? { image } : {}),
  }
}

function sanitizeDb(data: unknown): DbData {
  const input = asObject(data) ?? {}

  const topics = Array.isArray(input.topics)
    ? input.topics
        .filter(Boolean)
        .map((topic) => sanitizeTopic(topic))
        .filter((topic): topic is TopicData => topic !== null)
    : []

  const blog = Array.isArray(input.blog)
    ? input.blog
        .filter(Boolean)
        .map((post) => sanitizeBlogPost(post))
        .filter((post): post is BlogPost => post !== null)
    : []

  return { topics, blog }
}

async function readDb(): Promise<DbData> {
  try {
    const data = await fs.readFile(DB_FILE, "utf-8")
    return sanitizeDb(JSON.parse(data))
  } catch {
    return EMPTY_DB
  }
}

async function writeDb(data: DbData) {
  await fs.mkdir(path.dirname(DB_FILE), { recursive: true })
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), "utf-8")
}

export async function GET() {
  const db = await readDb()
  return NextResponse.json(db)
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const db = sanitizeDb(data)
    await writeDb(db)
    return NextResponse.json({ success: true, data: db })
  } catch (error) {
    console.error("Failed to save DB:", error)
    return NextResponse.json({ error: "Failed to save DB" }, { status: 500 })
  }
}
