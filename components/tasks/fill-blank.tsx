"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"

interface FillBlankProps {
  question: string
  correctAnswer: string
  onAnswer: (correct: boolean) => void
  color: string
}

export function FillBlank({
  question,
  correctAnswer,
  onAnswer,
  color,
}: FillBlankProps) {
  const [input, setInput] = useState("")
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleSubmit = () => {
    if (answered || !input.trim()) return
    const correct =
      input.trim().toLowerCase() === correctAnswer.toLowerCase()
    setIsCorrect(correct)
    setAnswered(true)
    onAnswer(correct)
  }

  const parts = question.split("___")

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-card-foreground sm:text-2xl">
        {"Бос орынды толтырыңыз:"}
      </h3>
      <div
        className="rounded-2xl border-3 bg-card p-6 shadow-sm"
        style={{ borderColor: `${color}33` }}
      >
        <p className="text-xl font-bold text-card-foreground sm:text-2xl">
          {parts[0]}
          <span
            className="mx-1 inline-block min-w-[120px] border-b-4 px-2 text-center"
            style={{
              borderColor: answered
                ? isCorrect
                  ? "#10b981"
                  : "#ef4444"
                : color,
            }}
          >
            {answered ? (
              <span
                className={`font-black ${
                  isCorrect ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {input}
              </span>
            ) : null}
          </span>
          {parts[1]}
        </p>

        {answered && !isCorrect && (
          <p className="mt-3 text-lg font-bold text-emerald-600">
            {"Дұрыс жауап: "}{correctAnswer}
          </p>
        )}
      </div>

      {!answered && (
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={"Жауабыңызды жазыңыз..."}
            className="flex-1 rounded-2xl border-3 bg-card px-5 py-4 text-lg font-bold text-card-foreground placeholder:text-muted-foreground focus:outline-none"
            style={{ borderColor: `${color}55` }}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="rounded-2xl px-6 py-4 text-lg font-black text-white shadow-md transition-all duration-200 hover:scale-105 disabled:opacity-40"
            style={{ backgroundColor: color }}
          >
            {"Тексеру"}
          </button>
        </div>
      )}

      {answered && (
        <div
          className={`flex items-center gap-3 rounded-2xl px-5 py-3 ${
            isCorrect ? "bg-emerald-50" : "bg-red-50"
          }`}
        >
          {isCorrect ? (
            <Check className="h-6 w-6 text-emerald-600" />
          ) : (
            <X className="h-6 w-6 text-red-500" />
          )}
          <span
            className={`text-lg font-bold ${
              isCorrect ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {isCorrect ? "Дұрыс!" : "Қате!"}
          </span>
        </div>
      )}
    </div>
  )
}
