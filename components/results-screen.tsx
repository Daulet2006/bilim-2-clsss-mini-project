"use client"

import Link from "next/link"
import { Trophy, RotateCcw, Home, Star } from "lucide-react"
import { useEffect, useState } from "react"

interface ResultsScreenProps {
  correct: number
  total: number
  topicId: string
  color: string
}

export function ResultsScreen({
  correct,
  total,
  topicId,
  color,
}: ResultsScreenProps) {
  const percentage = Math.round((correct / total) * 100)
  const [animatedPercentage, setAnimatedPercentage] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage)
    }, 300)
    return () => clearTimeout(timer)
  }, [percentage])

  const getMessage = () => {
    if (percentage === 100) return "Керемет! Барлығы дұрыс!"
    if (percentage >= 75) return "Жарайсың! Өте жақсы!"
    if (percentage >= 50) return "Жақсы! Жалғастыр!"
    return "Қайталап көрейік!"
  }

  const getStars = () => {
    if (percentage === 100) return 3
    if (percentage >= 60) return 2
    return 1
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-10">
      <div
        className="mb-8 flex h-28 w-28 items-center justify-center rounded-full shadow-xl sm:h-36 sm:w-36"
        style={{ backgroundColor: color }}
      >
        <Trophy className="h-14 w-14 text-white sm:h-18 sm:w-18" />
      </div>

      <div className="mb-4 flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Star
            key={i}
            className={`h-10 w-10 transition-all duration-500 sm:h-12 sm:w-12 ${
              i < getStars()
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted"
            }`}
            style={{
              transitionDelay: `${i * 200}ms`,
              transform: i < getStars() ? "scale(1)" : "scale(0.8)",
            }}
          />
        ))}
      </div>

      <h2 className="mb-2 text-center text-3xl font-black text-foreground sm:text-4xl">
        {getMessage()}
      </h2>

      <div className="mb-8 mt-4 flex items-baseline gap-1">
        <span
          className="text-6xl font-black sm:text-7xl"
          style={{ color }}
        >
          {animatedPercentage}%
        </span>
      </div>

      <p className="mb-8 text-xl font-bold text-muted-foreground">
        {correct} / {total} {"дұрыс жауап"}
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 rounded-full px-8 py-4 text-lg font-black text-white shadow-lg transition-all hover:scale-105"
          style={{ backgroundColor: color }}
        >
          <RotateCcw className="h-5 w-5" />
          {"Қайталау"}
        </button>
        <Link
          href={`/topic/${topicId}`}
          className="flex items-center gap-2 rounded-full border-3 bg-card px-8 py-4 text-lg font-black text-card-foreground shadow-lg transition-all hover:scale-105"
          style={{ borderColor: `${color}44` }}
        >
          {"Сабақтарға оралу"}
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full border-3 bg-card px-8 py-4 text-lg font-black text-card-foreground shadow-lg transition-all hover:scale-105"
          style={{ borderColor: `${color}44` }}
        >
          <Home className="h-5 w-5" />
          {"Басты бет"}
        </Link>
      </div>
    </div>
  )
}
