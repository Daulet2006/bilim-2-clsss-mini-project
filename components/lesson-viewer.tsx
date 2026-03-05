"use client"

import { useState } from "react"
import { BookReader } from "@/components/book-reader"
import { MultipleChoice } from "@/components/tasks/multiple-choice"
import { TrueFalse } from "@/components/tasks/true-false"
import { FillBlank } from "@/components/tasks/fill-blank"
import { MatchTask } from "@/components/tasks/match-task"
import { ResultsScreen } from "@/components/results-screen"
import { ChevronRight, BookOpen, Brain } from "lucide-react"

interface Task {
  type: string
  question: string
  options?: string[]
  correctAnswer?: number | boolean | string
  pairs?: { left: string; right: string }[]
}

interface LessonViewerProps {
  lesson: {
    id: string
    title: string
    pages: { content: string; image?: string }[]
    tasks: Task[]
  }
  topicId: string
  color: string
}

type ViewMode = "reading" | "tasks" | "results"

export function LessonViewer({ lesson, topicId, color }: LessonViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("reading")
  const [currentPage, setCurrentPage] = useState(0)
  const [currentTask, setCurrentTask] = useState(0)
  const [score, setScore] = useState(0)
  const [taskAnswered, setTaskAnswered] = useState(false)

  const handleAnswer = (correct: boolean) => {
    if (correct) setScore((prev) => prev + 1)
    setTaskAnswered(true)
  }

  const handleNextTask = () => {
    if (currentTask < lesson.tasks.length - 1) {
      setCurrentTask((prev) => prev + 1)
      setTaskAnswered(false)
    } else {
      setViewMode("results")
    }
  }

  const task = lesson.tasks[currentTask]

  if (viewMode === "results") {
    return (
      <ResultsScreen
        correct={score}
        total={lesson.tasks.length}
        topicId={topicId}
        color={color}
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Progress tabs */}
      <div className="mb-8 flex items-center justify-center gap-4">
        <button
          onClick={() => setViewMode("reading")}
          className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all sm:px-6 sm:text-base ${
            viewMode === "reading"
              ? "text-white shadow-lg"
              : "bg-muted text-muted-foreground"
          }`}
          style={
            viewMode === "reading" ? { backgroundColor: color } : undefined
          }
        >
          <BookOpen className="h-5 w-5" />
          {"Оқу"}
        </button>
        <button
          onClick={() => setViewMode("tasks")}
          className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all sm:px-6 sm:text-base ${
            viewMode === "tasks"
              ? "text-white shadow-lg"
              : "bg-muted text-muted-foreground"
          }`}
          style={
            viewMode === "tasks" ? { backgroundColor: color } : undefined
          }
        >
          <Brain className="h-5 w-5" />
          {"Тапсырмалар"}
        </button>
      </div>

      {viewMode === "reading" && (
        <BookReader
          pages={lesson.pages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onFinishReading={() => setViewMode("tasks")}
          color={color}
        />
      )}

      {viewMode === "tasks" && (
        <div className="flex flex-col gap-6">
          {/* Task progress */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-muted-foreground">
              {"Тапсырма"} {currentTask + 1} / {lesson.tasks.length}
            </span>
            <div className="flex gap-1.5">
              {lesson.tasks.map((_, i) => (
                <div
                  key={i}
                  className="h-2.5 w-8 rounded-full transition-all duration-300 sm:w-12"
                  style={{
                    backgroundColor:
                      i <= currentTask ? color : `${color}22`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Task card */}
          <div
            className="rounded-3xl border-3 bg-card p-6 shadow-lg sm:p-8"
            style={{ borderColor: `${color}33` }}
          >
            {task.type === "multiple_choice" && (
              <MultipleChoice
                key={currentTask}
                question={task.question}
                options={task.options || []}
                correctAnswer={task.correctAnswer as number}
                onAnswer={handleAnswer}
                color={color}
              />
            )}
            {task.type === "true_false" && (
              <TrueFalse
                key={currentTask}
                question={task.question}
                correctAnswer={task.correctAnswer as boolean}
                onAnswer={handleAnswer}
                color={color}
              />
            )}
            {task.type === "fill_blank" && (
              <FillBlank
                key={currentTask}
                question={task.question}
                correctAnswer={task.correctAnswer as string}
                onAnswer={handleAnswer}
                color={color}
              />
            )}
            {task.type === "match" && (
              <MatchTask
                key={currentTask}
                question={task.question}
                pairs={task.pairs || []}
                onAnswer={handleAnswer}
                color={color}
              />
            )}
          </div>

          {/* Next button */}
          {taskAnswered && (
            <div className="flex justify-center">
              <button
                onClick={handleNextTask}
                className="flex items-center gap-2 rounded-full px-8 py-4 text-lg font-black text-white shadow-lg transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: color }}
              >
                {currentTask < lesson.tasks.length - 1
                  ? "Келесі тапсырма"
                  : "Нәтижені көру"}
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
