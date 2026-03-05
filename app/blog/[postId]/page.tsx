"use client"

import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, Calendar, FileText } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  content: string
  date: string
  image?: string
}

interface DbData {
  blog: BlogPost[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function BlogPostPage() {
  const params = useParams()
  const postId = params.postId as string
  const { data, isLoading } = useSWR<DbData>("/api/db", fetcher)

  const post = data?.blog?.find((p) => p.id === postId)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-background">
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <FileText className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <p className="mb-4 text-xl font-bold text-muted-foreground">
            {"Жазба табылмады"}
          </p>
          <Link
            href="/blog"
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow transition-all hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4" />
            {"Блогқа оралу"}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-primary px-6 pb-8 pt-6 sm:px-8 sm:pb-10 sm:pt-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/20 px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-foreground/30"
          >
            <ArrowLeft className="h-4 w-4" />
            {"Блог"}
          </Link>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary-foreground/70">
            <Calendar className="h-4 w-4" />
            {new Date(post.date).toLocaleDateString("kk-KZ", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <h1 className="mt-2 text-balance text-3xl font-black text-primary-foreground sm:text-4xl">
            {post.title}
          </h1>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {post.image && post.image.length > 0 && (
          <div className="relative mb-8 h-56 w-full overflow-hidden rounded-2xl shadow-lg sm:h-72">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        <div className="prose-none">
          {post.content.split("\n").map((paragraph, i) => (
            <p
              key={i}
              className="mb-4 text-lg font-semibold leading-relaxed text-foreground"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full bg-muted px-6 py-3 text-sm font-bold text-foreground transition-all hover:bg-muted/80"
          >
            <ArrowLeft className="h-4 w-4" />
            {"Барлық жазбалар"}
          </Link>
        </div>
      </article>
    </main>
  )
}
