"use client"

import { useState, useMemo } from "react"
import { Check, X } from "lucide-react"

interface MatchTaskProps {
  question: string
  pairs: { left: string; right: string }[]
  onAnswer: (correct: boolean) => void
  color: string
}

export function MatchTask({
  question,
  pairs,
  onAnswer,
  color,
}: MatchTaskProps) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [matches, setMatches] = useState<Map<number, number>>(new Map())
  const [answered, setAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)

  const shuffledRight = useMemo(() => {
    const indices = pairs.map((_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    return indices
  }, [pairs])

  const handleLeftClick = (index: number) => {
    if (answered || matches.has(index)) return
    setSelectedLeft(index)
  }

  const handleRightClick = (shuffledIndex: number) => {
    if (answered || selectedLeft === null) return

    const rightOriginalIndex = shuffledRight[shuffledIndex]

    // Check if this right item is already matched
    const alreadyMatched = Array.from(matches.values()).includes(shuffledIndex)
    if (alreadyMatched) return

    const newMatches = new Map(matches)
    newMatches.set(selectedLeft, shuffledIndex)
    setMatches(newMatches)
    setSelectedLeft(null)

    if (newMatches.size === pairs.length) {
      let correct = 0
      newMatches.forEach((rightShuffledIdx, leftIdx) => {
        if (shuffledRight[rightShuffledIdx] === leftIdx) {
          correct++
        }
      })
      setCorrectCount(correct)
      setAnswered(true)
      onAnswer(correct === pairs.length)
    }
  }

  const getLeftStyle = (index: number) => {
    if (matches.has(index)) {
      if (answered) {
        const rightShuffledIdx = matches.get(index)!
        const isCorrect = shuffledRight[rightShuffledIdx] === index
        return isCorrect
          ? { bg: "bg-emerald-50", border: "#10b981" }
          : { bg: "bg-red-50", border: "#ef4444" }
      }
      return { bg: "bg-primary/5", border: `${color}88` }
    }
    if (selectedLeft === index) {
      return { bg: "bg-primary/10", border: color }
    }
    return { bg: "bg-card", border: `${color}33` }
  }

  const getRightStyle = (shuffledIndex: number) => {
    const matchedLeft = Array.from(matches.entries()).find(
      ([, v]) => v === shuffledIndex
    )
    if (matchedLeft) {
      if (answered) {
        const isCorrect = shuffledRight[shuffledIndex] === matchedLeft[0]
        return isCorrect
          ? { bg: "bg-emerald-50", border: "#10b981" }
          : { bg: "bg-red-50", border: "#ef4444" }
      }
      return { bg: "bg-primary/5", border: `${color}88` }
    }
    return { bg: "bg-card", border: `${color}33` }
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-card-foreground sm:text-2xl">
        {question}
      </h3>
      {!answered && (
        <p className="text-sm font-semibold text-muted-foreground">
          {"Сол жақтан сөзді таңдап, оң жақтан жұбын табыңыз"}
        </p>
      )}
      <div className="flex gap-4 sm:gap-6">
        <div className="flex flex-1 flex-col gap-3">
          {pairs.map((pair, i) => {
            const style = getLeftStyle(i)
            return (
              <button
                key={`left-${i}`}
                onClick={() => handleLeftClick(i)}
                disabled={answered || matches.has(i)}
                className={`rounded-2xl border-3 ${style.bg} px-4 py-4 text-center text-lg font-bold text-card-foreground shadow-sm transition-all duration-200 ${
                  !answered && !matches.has(i)
                    ? "hover:scale-105 hover:shadow-md"
                    : ""
                }`}
                style={{ borderColor: style.border }}
              >
                {pair.left}
              </button>
            )
          })}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          {shuffledRight.map((originalIdx, shuffledIdx) => {
            const style = getRightStyle(shuffledIdx)
            const isMatched = Array.from(matches.values()).includes(shuffledIdx)
            return (
              <button
                key={`right-${shuffledIdx}`}
                onClick={() => handleRightClick(shuffledIdx)}
                disabled={answered || isMatched || selectedLeft === null}
                className={`rounded-2xl border-3 ${style.bg} px-4 py-4 text-center text-lg font-bold text-card-foreground shadow-sm transition-all duration-200 ${
                  !answered && !isMatched && selectedLeft !== null
                    ? "hover:scale-105 hover:shadow-md"
                    : ""
                }`}
                style={{ borderColor: style.border }}
              >
                {pairs[originalIdx].right}
              </button>
            )
          })}
        </div>
      </div>

      {answered && (
        <div
          className={`flex items-center gap-3 rounded-2xl px-5 py-3 ${
            correctCount === pairs.length ? "bg-emerald-50" : "bg-amber-50"
          }`}
        >
          {correctCount === pairs.length ? (
            <Check className="h-6 w-6 text-emerald-600" />
          ) : (
            <X className="h-6 w-6 text-amber-600" />
          )}
          <span
            className={`text-lg font-bold ${
              correctCount === pairs.length
                ? "text-emerald-700"
                : "text-amber-700"
            }`}
          >
            {correctCount}/{pairs.length} {"дұрыс"}
          </span>
        </div>
      )}
    </div>
  )
}
