"use client"

import Image from "next/image"
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react"

interface BookReaderProps {
  pages: { content: string; image?: string }[]
  currentPage: number
  onPageChange: (page: number) => void
  onFinishReading: () => void
  color: string
}

export function BookReader({
  pages,
  currentPage,
  onPageChange,
  onFinishReading,
  color,
}: BookReaderProps) {
  const isLastPage = currentPage === pages.length - 1
  const isFirstPage = currentPage === 0

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center gap-2">
        <BookOpen className="h-5 w-5" style={{ color }} />
        <span className="text-sm font-bold text-muted-foreground">
          {currentPage + 1} / {pages.length} {"бет"}
        </span>
      </div>

      <div className="relative w-full max-w-2xl">
        <div
          className="min-h-[240px] rounded-3xl border-4 bg-card p-8 shadow-xl sm:min-h-[300px] sm:p-10"
          style={{ borderColor: `${color}44` }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: color }}
            >
              <span className="text-lg font-black">{currentPage + 1}</span>
            </div>
            <span className="text-sm font-bold" style={{ color }}>
              {currentPage + 1}-{"бет"}
            </span>
          </div>
          <p className="text-xl leading-relaxed font-semibold text-card-foreground sm:text-2xl">
            {pages[currentPage].content}
          </p>
          {pages[currentPage].image && (
            <div className="relative mt-6 h-48 w-full overflow-hidden rounded-2xl sm:h-64">
              <Image
                src={pages[currentPage].image!}
                alt="Бет суреті"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
        </div>

        {/* Page dots */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className="h-3 w-3 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i === currentPage ? color : `${color}33`,
                transform: i === currentPage ? "scale(1.3)" : "scale(1)",
              }}
              aria-label={`${i + 1}-бет`}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 bg-card text-foreground shadow-md transition-all duration-200 hover:scale-110 disabled:opacity-30 disabled:hover:scale-100 sm:h-16 sm:w-16"
          style={{ borderColor: `${color}44` }}
          aria-label="Алдыңғы бет"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>

        {isLastPage ? (
          <button
            onClick={onFinishReading}
            className="rounded-full px-8 py-4 text-lg font-black text-white shadow-lg transition-all duration-200 hover:scale-105 sm:text-xl"
            style={{ backgroundColor: color }}
          >
            {"Тапсырмаларға кіру"}
          </button>
        ) : (
          <button
            onClick={() => onPageChange(currentPage + 1)}
            className="rounded-full px-8 py-4 text-lg font-black text-white shadow-lg transition-all duration-200 hover:scale-105 sm:text-xl"
            style={{ backgroundColor: color }}
          >
            {"Келесі бет"}
          </button>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 bg-card text-foreground shadow-md transition-all duration-200 hover:scale-110 disabled:opacity-30 disabled:hover:scale-100 sm:h-16 sm:w-16"
          style={{ borderColor: `${color}44` }}
          aria-label="Келесі бет"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      </div>
    </div>
  )
}
