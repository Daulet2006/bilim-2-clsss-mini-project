"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft } from "lucide-react"
import { LessonViewer } from "@/components/lesson-viewer"

interface DbData {
  topics: {
    id: string
    title: string
    color: string
    lessons: {
      id: string
      title: string
      pages: { content: string; image?: string }[]
      tasks: {
        type: string
        question: string
        options?: string[]
        correctAnswer?: number | boolean | string
        pairs?: { left: string; right: string }[]
      }[]
    }[]
  }[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function LessonPage() {
  const params = useParams()
  const topicId = params.topicId as string
  const lessonId = params.lessonId as string
  const { data, isLoading } = useSWR<DbData>("/api/db", fetcher)

  const topic = data?.topics?.find((t) => t.id === topicId)
  const lesson = topic?.lessons?.find((l) => l.id === lessonId)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!topic || !lesson) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p className="mb-4 text-xl font-bold text-muted-foreground">
          {"Сабақ табылмады"}
        </p>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {"Басты бет"}
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <header
        className="px-6 pb-6 pt-6 sm:px-8"
        style={{ backgroundColor: topic.color }}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Link
            href={`/topic/${topic.id}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
            aria-label="Артқа"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-sm font-bold text-white/80">{topic.title}</p>
            <h1 className="text-xl font-black text-white sm:text-2xl">
              {lesson.title}
            </h1>
          </div>
        </div>
      </header>

      <LessonViewer lesson={lesson} topicId={topic.id} color={topic.color} />
    </main>
  )
}
