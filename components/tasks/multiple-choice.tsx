"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"

interface MultipleChoiceProps {
  question: string
  options: string[]
  correctAnswer: number
  onAnswer: (correct: boolean) => void
  color: string
}

export function MultipleChoice({
  question,
  options,
  correctAnswer,
  onAnswer,
  color,
}: MultipleChoiceProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)

  const handleSelect = (index: number) => {
    if (answered) return
    setSelected(index)
    setAnswered(true)
    onAnswer(index === correctAnswer)
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-card-foreground sm:text-2xl">
        {question}
      </h3>
      <div className="flex flex-col gap-3">
        {options.map((option, i) => {
          let bgColor = "bg-card"
          let borderColor = `${color}33`
          let textColor = "text-card-foreground"
          let icon = null

          if (answered) {
            if (i === correctAnswer) {
              bgColor = "bg-emerald-50"
              borderColor = "#10b981"
              textColor = "text-emerald-800"
              icon = <Check className="h-6 w-6 shrink-0 text-emerald-600" />
            } else if (i === selected && i !== correctAnswer) {
              bgColor = "bg-red-50"
              borderColor = "#ef4444"
              textColor = "text-red-800"
              icon = <X className="h-6 w-6 shrink-0 text-red-500" />
            }
          } else if (i === selected) {
            borderColor = color
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={`flex items-center gap-3 rounded-2xl border-3 ${bgColor} px-5 py-4 text-left text-lg font-bold ${textColor} shadow-sm transition-all duration-200 ${
                !answered ? "hover:scale-[1.02] hover:shadow-md" : ""
              }`}
              style={{ borderColor }}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-black text-white"
                style={{
                  backgroundColor:
                    answered && i === correctAnswer
                      ? "#10b981"
                      : answered && i === selected
                        ? "#ef4444"
                        : color,
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{option}</span>
              {icon}
            </button>
          )
        })}
      </div>
    </div>
  )
}
