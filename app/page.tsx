"use client"

import Link from "next/link"
import useSWR from "swr"
import { TopicCard } from "@/components/topic-card"
import { BookOpen, FileText } from "lucide-react"

interface TopicData {
  id: string
  title: string
  description: string
  color: string
  image?: string
  lessons: unknown[]
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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function HomePage() {
  const { data, isLoading } = useSWR<DbData>("/api/db", fetcher)

  const topics = data?.topics || []
  const recentPosts = (data?.blog || [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  return (
    <main className="min-h-screen bg-background">
      <header className="relative overflow-hidden bg-primary px-6 pb-12 pt-10 text-center sm:px-8 sm:pb-16 sm:pt-14">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-4 top-8 h-16 w-16 rounded-full bg-accent sm:h-24 sm:w-24" />
          <div className="absolute right-8 top-16 h-12 w-12 rounded-full bg-secondary sm:h-20 sm:w-20" />
          <div className="absolute bottom-4 left-1/3 h-10 w-10 rounded-full bg-accent sm:h-16 sm:w-16" />
        </div>
        <div className="relative">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent shadow-lg sm:h-24 sm:w-24">
            <BookOpen className="h-10 w-10 text-accent-foreground sm:h-12 sm:w-12" />
          </div>
          <h1 className="text-4xl font-black text-primary-foreground sm:text-5xl">
            Bilim
          </h1>
          <p className="mt-2 text-lg font-bold text-primary-foreground/90 sm:text-xl">
            {"2-сынып \u2014 Оқу мен ойын!"}
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <h2 className="mb-6 text-center text-2xl font-extrabold text-foreground sm:mb-8 sm:text-3xl">
          {"Тақырыптарды таңда"}
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                id={topic.id}
                title={topic.title}
                description={topic.description}
                color={topic.color}
                image={topic.image}
              />
            ))}
          </div>
        )}
      </section>

      {/* Blog preview section */}
      {recentPosts.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6 sm:pb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
              Блог
            </h2>
            <Link
              href="/blog"
              className="text-sm font-bold text-primary transition-colors hover:underline"
            >
              {"Барлығын көру"}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="group">
                <div className="overflow-hidden rounded-2xl border-2 border-border bg-card shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                  <div className="relative h-36 w-full overflow-hidden">
                    {post.image && post.image.length > 0 ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10">
                        <FileText className="h-10 w-10 text-primary/40" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">
                      {new Date(post.date).toLocaleDateString("kk-KZ", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <h3 className="line-clamp-2 text-base font-extrabold text-card-foreground">
                      {post.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="bg-muted px-4 py-6 text-center">
        <p className="text-sm font-semibold text-muted-foreground">
          Bilim &mdash; 2-сынып оқушыларына арналған
        </p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <Link
            href="/blog"
            className="text-xs font-bold text-muted-foreground/50 transition-colors hover:text-primary"
          >
            Блог
          </Link>
          <Link
            href="/admin"
            className="text-xs font-bold text-muted-foreground/50 transition-colors hover:text-primary"
          >
            Админ панель
          </Link>
        </div>
      </footer>
    </main>
  )
}
