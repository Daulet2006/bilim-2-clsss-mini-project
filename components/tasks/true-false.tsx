"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"

interface TrueFalseProps {
  question: string
  correctAnswer: boolean
  onAnswer: (correct: boolean) => void
  color: string
}

export function TrueFalse({
  question,
  correctAnswer,
  onAnswer,
  color,
}: TrueFalseProps) {
  const [selected, setSelected] = useState<boolean | null>(null)
  const [answered, setAnswered] = useState(false)

  const handleSelect = (value: boolean) => {
    if (answered) return
    setSelected(value)
    setAnswered(true)
    onAnswer(value === correctAnswer)
  }

  const getStyle = (value: boolean) => {
    if (!answered) {
      return {
        bg: "bg-card",
        border: `${color}33`,
        text: "text-card-foreground",
      }
    }
    if (value === correctAnswer) {
      return {
        bg: "bg-emerald-50",
        border: "#10b981",
        text: "text-emerald-800",
      }
    }
    if (value === selected && value !== correctAnswer) {
      return {
        bg: "bg-red-50",
        border: "#ef4444",
        text: "text-red-800",
      }
    }
    return {
      bg: "bg-card",
      border: `${color}33`,
      text: "text-card-foreground",
    }
  }

  const trueStyle = getStyle(true)
  const falseStyle = getStyle(false)

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-card-foreground sm:text-2xl">
        {question}
      </h3>
      <div className="flex gap-4">
        <button
          onClick={() => handleSelect(true)}
          disabled={answered}
          className={`flex flex-1 flex-col items-center gap-2 rounded-2xl border-3 ${trueStyle.bg} px-6 py-6 ${trueStyle.text} shadow-sm transition-all duration-200 ${
            !answered ? "hover:scale-105 hover:shadow-md" : ""
          }`}
          style={{ borderColor: trueStyle.border }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              backgroundColor:
                answered && true === correctAnswer
                  ? "#10b981"
                  : answered && true === selected
                    ? "#ef4444"
                    : color,
            }}
          >
            <Check className="h-8 w-8 text-white" />
          </div>
          <span className="text-xl font-black">{"Иә"}</span>
        </button>
        <button
          onClick={() => handleSelect(false)}
          disabled={answered}
          className={`flex flex-1 flex-col items-center gap-2 rounded-2xl border-3 ${falseStyle.bg} px-6 py-6 ${falseStyle.text} shadow-sm transition-all duration-200 ${
            !answered ? "hover:scale-105 hover:shadow-md" : ""
          }`}
          style={{ borderColor: falseStyle.border }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              backgroundColor:
                answered && false === correctAnswer
                  ? "#10b981"
                  : answered && false === selected
                    ? "#ef4444"
                    : color,
            }}
          >
            <X className="h-8 w-8 text-white" />
          </div>
          <span className="text-xl font-black">{"Жоқ"}</span>
        </button>
      </div>
    </div>
  )
}
