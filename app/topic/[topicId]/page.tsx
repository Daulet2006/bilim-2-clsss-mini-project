"use client"

import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, BookOpen } from "lucide-react"

const topicImages: Record<string, string> = {
  otbasym: "/images/otbasym.jpg",
  dostarym: "/images/dostarym.jpg",
  kazakhstan: "/images/kazakhstan.jpg",
  ramizder: "/images/ramizder.jpg",
  alfarabi: "/images/alfarabi.jpg",
  tabigat: "/images/tabigat.jpg",
  sayahat: "/images/sayahat.jpg",
}

interface TopicData {
  id: string
  title: string
  description: string
  color: string
  image?: string
  lessons: {
    id: string
    title: string
    pages: { content: string; image?: string }[]
    tasks: unknown[]
  }[]
}

interface DbData {
  topics: TopicData[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function TopicPage() {
  const params = useParams()
  const topicId = params.topicId as string
  const { data, isLoading } = useSWR<DbData>("/api/db", fetcher)

  const topic = data?.topics?.find((t) => t.id === topicId)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!topic) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p className="mb-4 text-xl font-bold text-muted-foreground">
          {"Тақырып табылмады"}
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

  const imgSrc = topic.image || topicImages[topic.id] || "/images/otbasym.jpg"

  return (
    <main className="min-h-screen bg-background">
      <header
        className="relative overflow-hidden px-6 pb-10 pt-6 sm:px-8 sm:pb-14 sm:pt-8"
        style={{ backgroundColor: topic.color }}
      >
        <Link
          href="/"
          className="relative z-10 mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/30"
        >
          <ArrowLeft className="h-4 w-4" />
          {"Басты бет"}
        </Link>
        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-end">
          <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-3xl border-4 border-white/40 shadow-xl sm:h-44 sm:w-44">
            <Image
              src={imgSrc}
              alt={topic.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-black text-white sm:text-4xl">
              {topic.title}
            </h1>
            <p className="mt-2 text-lg font-bold text-white/90">
              {topic.description}
            </p>
            <p className="mt-1 text-sm font-semibold text-white/70">
              {topic.lessons.length} {"сабақ"}
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <h2 className="mb-6 text-center text-2xl font-extrabold text-foreground sm:text-3xl">
          {"Сабақтар"}
        </h2>
        <div className="flex flex-col gap-4">
          {topic.lessons.map((lesson, index) => (
            <Link
              key={lesson.id}
              href={`/topic/${topic.id}/lesson/${lesson.id}`}
              className="group"
            >
              <div
                className="flex items-center gap-5 rounded-2xl border-2 bg-card p-5 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl sm:p-6"
                style={{ borderColor: `${topic.color}44` }}
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md sm:h-16 sm:w-16"
                  style={{ backgroundColor: topic.color }}
                >
                  <BookOpen className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-sm font-bold"
                    style={{ color: topic.color }}
                  >
                    {index + 1}-{"сабақ"}
                  </p>
                  <h3 className="text-lg font-extrabold text-card-foreground sm:text-xl">
                    {lesson.title}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    {lesson.pages.length} {"бет"} &middot;{" "}
                    {lesson.tasks.length} {"тапсырма"}
                  </p>
                </div>
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-transform group-hover:scale-110"
                  style={{ backgroundColor: topic.color }}
                >
                  <ArrowLeft className="h-5 w-5 rotate-180" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
