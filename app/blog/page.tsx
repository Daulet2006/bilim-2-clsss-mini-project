"use client"

import Link from "next/link"
import Image from "next/image"
import useSWR from "swr"
import { ArrowLeft, Calendar, FileText, BookOpen } from "lucide-react"

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

export default function BlogPage() {
  const { data, isLoading } = useSWR<DbData>("/api/db", fetcher)
  const posts = (data?.blog || []).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <main className="min-h-screen bg-background">
      <header className="relative overflow-hidden bg-primary px-6 pb-10 pt-8 text-center sm:px-8 sm:pb-14 sm:pt-10">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-6 top-6 h-14 w-14 rounded-full bg-accent sm:h-20 sm:w-20" />
          <div className="absolute right-10 top-12 h-10 w-10 rounded-full bg-secondary sm:h-16 sm:w-16" />
        </div>
        <div className="relative">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/20 px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-foreground/30"
          >
            <ArrowLeft className="h-4 w-4" />
            {"Басты бет"}
          </Link>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-accent shadow-lg sm:h-20 sm:w-20">
            <FileText className="h-8 w-8 text-accent-foreground sm:h-10 sm:w-10" />
          </div>
          <h1 className="text-3xl font-black text-primary-foreground sm:text-4xl">
            Блог
          </h1>
          <p className="mt-2 text-base font-bold text-primary-foreground/80 sm:text-lg">
            {"Жаңалықтар мен мақалалар"}
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <p className="text-lg font-bold text-muted-foreground">
              {"Блог жазбалары жоқ"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="group">
                <article className="overflow-hidden rounded-2xl border-2 border-border bg-card shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-xl">
                  <div className="relative h-48 w-full overflow-hidden sm:h-56">
                    {post.image && post.image.length > 0 ? (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10">
                        <FileText className="h-12 w-12 text-primary/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(post.date).toLocaleDateString("kk-KZ", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <h2 className="mb-2 text-xl font-extrabold text-card-foreground sm:text-2xl">
                      {post.title}
                    </h2>
                    <p className="line-clamp-3 text-sm font-semibold leading-relaxed text-muted-foreground">
                      {post.content}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
