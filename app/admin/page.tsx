"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import useSWR, { mutate } from "swr"
import {
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  ImagePlus,
  X,
  BookOpen,
  Brain,
  Pencil,
  FileText,
  Calendar,
} from "lucide-react"

// Types
interface TaskData {
  type: string
  question: string
  options?: string[]
  correctAnswer?: number | boolean | string
  pairs?: { left: string; right: string }[]
}

interface PageData {
  content: string
  image?: string
}

interface LessonData {
  id: string
  title: string
  pages: PageData[]
  tasks: TaskData[]
}

interface TopicData {
  id: string
  title: string
  description: string
  icon: string
  color: string
  image?: string
  lessons: LessonData[]
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

function generateId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`
}

// --- Image Upload Component ---
function ImageUploader({
  currentImage,
  onImageChange,
  label,
}: {
  currentImage?: string
  onImageChange: (url: string | undefined) => void
  label: string
}) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) {
        onImageChange(data.url)
      } else {
        alert("Сурет жүктелмеді: " + (data.error || "белгісіз қате"))
      }
    } catch {
      alert("Сурет жүктелмеді")
    } finally {
      setUploading(false)
    }
  }

  const hasImage = currentImage && currentImage.length > 0

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-bold text-foreground/70">{label}</span>
      {hasImage ? (
        <div className="relative inline-block">
          <div className="relative h-32 w-48 overflow-hidden rounded-xl border-2 border-border">
            <Image
              src={currentImage!}
              alt="Uploaded"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <button
            onClick={() => onImageChange(undefined)}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
            aria-label="Суретті жою"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <label
          className={`flex h-32 w-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border transition-colors hover:border-primary hover:bg-primary/5 ${uploading ? "pointer-events-none opacity-50" : ""}`}
        >
          <ImagePlus className="h-8 w-8 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">
            {uploading ? "Жүктелуде..." : "Сурет жүктеу"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  )
}

// --- Task Editor ---
function TaskEditor({
  task,
  onChange,
  onRemove,
}: {
  task: TaskData
  onChange: (t: TaskData) => void
  onRemove: () => void
}) {
  const updateField = (field: string, value: unknown) => {
    onChange({ ...task, [field]: value })
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-muted-foreground" />
          <select
            value={task.type}
            onChange={(e) => {
              const type = e.target.value
              const base: TaskData = { type, question: task.question }
              if (type === "multiple_choice") {
                base.options = ["", "", "", ""]
                base.correctAnswer = 0
              } else if (type === "true_false") {
                base.correctAnswer = true
              } else if (type === "fill_blank") {
                base.correctAnswer = ""
              } else if (type === "match") {
                base.pairs = [{ left: "", right: "" }]
              }
              onChange(base)
            }}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-semibold"
          >
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True / False</option>
            <option value="fill_blank">Fill Blank</option>
            <option value="match">Match</option>
          </select>
        </div>
        <button
          onClick={onRemove}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10"
          aria-label="Remove task"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <input
        type="text"
        placeholder="Сұрақ..."
        value={task.question}
        onChange={(e) => updateField("question", e.target.value)}
        className="mb-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold"
      />

      {task.type === "multiple_choice" && (
        <div className="flex flex-col gap-2">
          {(task.options || []).map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${task.question}`}
                checked={task.correctAnswer === i}
                onChange={() => updateField("correctAnswer", i)}
                className="accent-primary"
              />
              <input
                type="text"
                value={opt}
                placeholder={`${i + 1}-нұсқа`}
                onChange={(e) => {
                  const newOpts = [...(task.options || [])]
                  newOpts[i] = e.target.value
                  updateField("options", newOpts)
                }}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
              />
              {(task.options || []).length > 2 && (
                <button
                  onClick={() => {
                    const newOpts = (task.options || []).filter((_, j) => j !== i)
                    const newCorrect =
                      typeof task.correctAnswer === "number" && task.correctAnswer >= i && task.correctAnswer > 0
                        ? task.correctAnswer - 1
                        : task.correctAnswer
                    onChange({ ...task, options: newOpts, correctAnswer: newCorrect })
                  }}
                  className="text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => updateField("options", [...(task.options || []), ""])}
            className="mt-1 text-xs font-bold text-primary hover:underline"
          >
            + Нұсқа қосу
          </button>
        </div>
      )}

      {task.type === "true_false" && (
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="radio"
              checked={task.correctAnswer === true}
              onChange={() => updateField("correctAnswer", true)}
              className="accent-primary"
            />
            Дұрыс
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="radio"
              checked={task.correctAnswer === false}
              onChange={() => updateField("correctAnswer", false)}
              className="accent-primary"
            />
            Бұрыс
          </label>
        </div>
      )}

      {task.type === "fill_blank" && (
        <input
          type="text"
          placeholder="Дұрыс жауап..."
          value={(task.correctAnswer as string) || ""}
          onChange={(e) => updateField("correctAnswer", e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      )}

      {task.type === "match" && (
        <div className="flex flex-col gap-2">
          {(task.pairs || []).map((pair, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={pair.left}
                placeholder="Сол жақ"
                onChange={(e) => {
                  const newPairs = [...(task.pairs || [])]
                  newPairs[i] = { ...newPairs[i], left: e.target.value }
                  updateField("pairs", newPairs)
                }}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
              />
              <span className="text-muted-foreground">{"<->"}</span>
              <input
                type="text"
                value={pair.right}
                placeholder="Оң жақ"
                onChange={(e) => {
                  const newPairs = [...(task.pairs || [])]
                  newPairs[i] = { ...newPairs[i], right: e.target.value }
                  updateField("pairs", newPairs)
                }}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
              />
              {(task.pairs || []).length > 1 && (
                <button
                  onClick={() => {
                    const newPairs = (task.pairs || []).filter((_, j) => j !== i)
                    updateField("pairs", newPairs)
                  }}
                  className="text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() =>
              updateField("pairs", [...(task.pairs || []), { left: "", right: "" }])
            }
            className="mt-1 text-xs font-bold text-primary hover:underline"
          >
            + Жұп қосу
          </button>
        </div>
      )}
    </div>
  )
}

// --- Lesson Editor ---
function LessonEditor({
  lesson,
  onChange,
  onRemove,
}: {
  lesson: LessonData
  onChange: (l: LessonData) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [tab, setTab] = useState<"pages" | "tasks">("pages")

  return (
    <div className="rounded-2xl border border-border bg-muted/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-5 py-4"
      >
        {expanded ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
        <BookOpen className="h-5 w-5 text-primary" />
        <span className="flex-1 text-left text-base font-bold text-foreground">
          {lesson.title || "Жаңа сабақ"}
        </span>
        <span className="text-xs font-semibold text-muted-foreground">
          {lesson.pages.length} бет, {lesson.tasks.length} тапсырма
        </span>
      </button>

      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4">
          <div className="mb-4 flex items-center gap-3">
            <input
              type="text"
              placeholder="Сабақ атауы..."
              value={lesson.title}
              onChange={(e) => onChange({ ...lesson, title: e.target.value })}
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm font-bold"
            />
            <button
              onClick={onRemove}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10"
              aria-label="Remove lesson"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setTab("pages")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-colors ${tab === "pages" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              <BookOpen className="h-4 w-4" /> Беттер
            </button>
            <button
              onClick={() => setTab("tasks")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-colors ${tab === "tasks" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              <Brain className="h-4 w-4" /> Тапсырмалар
            </button>
          </div>

          {tab === "pages" && (
            <div className="flex flex-col gap-3">
              {lesson.pages.map((page, pi) => (
                <div key={pi} className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground">
                      {pi + 1}-бет
                    </span>
                    <button
                      onClick={() => {
                        const newPages = lesson.pages.filter((_, j) => j !== pi)
                        onChange({ ...lesson, pages: newPages })
                      }}
                      className="text-destructive"
                      aria-label="Remove page"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={page.content}
                    onChange={(e) => {
                      const newPages = [...lesson.pages]
                      newPages[pi] = { ...newPages[pi], content: e.target.value }
                      onChange({ ...lesson, pages: newPages })
                    }}
                    placeholder="Мәтін жазыңыз..."
                    rows={3}
                    className="mb-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm leading-relaxed"
                  />
                  <ImageUploader
                    currentImage={page.image}
                    onImageChange={(url) => {
                      const newPages = [...lesson.pages]
                      newPages[pi] = { ...newPages[pi], image: url }
                      onChange({ ...lesson, pages: newPages })
                    }}
                    label="Бет суреті"
                  />
                </div>
              ))}
              <button
                onClick={() =>
                  onChange({ ...lesson, pages: [...lesson.pages, { content: "" }] })
                }
                className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-3 text-sm font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" /> Бет қосу
              </button>
            </div>
          )}

          {tab === "tasks" && (
            <div className="flex flex-col gap-3">
              {lesson.tasks.map((task, ti) => (
                <TaskEditor
                  key={ti}
                  task={task}
                  onChange={(t) => {
                    const newTasks = [...lesson.tasks]
                    newTasks[ti] = t
                    onChange({ ...lesson, tasks: newTasks })
                  }}
                  onRemove={() => {
                    const newTasks = lesson.tasks.filter((_, j) => j !== ti)
                    onChange({ ...lesson, tasks: newTasks })
                  }}
                />
              ))}
              <button
                onClick={() =>
                  onChange({
                    ...lesson,
                    tasks: [
                      ...lesson.tasks,
                      { type: "multiple_choice", question: "", options: ["", "", "", ""], correctAnswer: 0 },
                    ],
                  })
                }
                className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-3 text-sm font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" /> Тапсырма қосу
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// --- Topic Editor ---
function TopicEditor({
  topic,
  onChange,
  onRemove,
}: {
  topic: TopicData
  onChange: (t: TopicData) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="overflow-hidden rounded-3xl border-2 bg-card shadow-md"
      style={{ borderColor: topic.color || "#ccc" }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-4 px-6 py-5"
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white"
          style={{ backgroundColor: topic.color || "#888" }}
        >
          {topic.title?.charAt(0) || "?"}
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-lg font-extrabold text-foreground">
            {topic.title || "Жаңа тақырып"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {topic.lessons.length} сабақ
          </p>
        </div>
        {expanded ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border px-6 pb-6 pt-5">
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">Атауы</label>
              <input
                type="text"
                value={topic.title}
                onChange={(e) => onChange({ ...topic, title: e.target.value })}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-bold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">Сипаттама</label>
              <input
                type="text"
                value={topic.description}
                onChange={(e) => onChange({ ...topic, description: e.target.value })}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">Түсі</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={topic.color}
                  onChange={(e) => onChange({ ...topic, color: e.target.value })}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-input"
                />
                <input
                  type="text"
                  value={topic.color}
                  onChange={(e) => onChange({ ...topic, color: e.target.value })}
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">Иконка</label>
              <input
                type="text"
                value={topic.icon}
                onChange={(e) => onChange({ ...topic, icon: e.target.value })}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mb-5">
            <ImageUploader
              currentImage={topic.image}
              onImageChange={(url) => onChange({ ...topic, image: url })}
              label="Тақырып суреті"
            />
          </div>

          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-base font-extrabold text-foreground">Сабақтар</h4>
          </div>
          <div className="flex flex-col gap-3">
            {topic.lessons.map((lesson, li) => (
              <LessonEditor
                key={lesson.id}
                lesson={lesson}
                onChange={(l) => {
                  const newLessons = [...topic.lessons]
                  newLessons[li] = l
                  onChange({ ...topic, lessons: newLessons })
                }}
                onRemove={() => {
                  const newLessons = topic.lessons.filter((_, j) => j !== li)
                  onChange({ ...topic, lessons: newLessons })
                }}
              />
            ))}
            <button
              onClick={() =>
                onChange({
                  ...topic,
                  lessons: [
                    ...topic.lessons,
                    { id: generateId(topic.id), title: "", pages: [{ content: "" }], tasks: [] },
                  ],
                })
              }
              className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-3 text-sm font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="h-4 w-4" /> Сабақ қосу
            </button>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={onRemove}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" /> Тақырыпты жою
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// --- Blog Post Editor ---
function BlogPostEditor({
  post,
  onChange,
  onRemove,
}: {
  post: BlogPost
  onChange: (p: BlogPost) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-border bg-card shadow-md">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-4 px-6 py-5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-base font-extrabold text-foreground">
            {post.title || "Жаңа жазба"}
          </h3>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {post.date || "Күні белгісіз"}
          </p>
        </div>
        {post.image && post.image.length > 0 && (
          <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-lg">
            <Image src={post.image} alt="" fill className="object-cover" unoptimized />
          </div>
        )}
        {expanded ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border px-6 pb-6 pt-5">
          <div className="mb-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">Тақырыбы</label>
              <input
                type="text"
                value={post.title}
                onChange={(e) => onChange({ ...post, title: e.target.value })}
                placeholder="Блог жазба тақырыбы..."
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-bold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">Күні</label>
              <input
                type="date"
                value={post.date}
                onChange={(e) => onChange({ ...post, date: e.target.value })}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">Мәтін</label>
              <textarea
                value={post.content}
                onChange={(e) => onChange({ ...post, content: e.target.value })}
                placeholder="Блог жазба мәтіні..."
                rows={6}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm leading-relaxed"
              />
            </div>
            <ImageUploader
              currentImage={post.image}
              onImageChange={(url) => onChange({ ...post, image: url || "" })}
              label="Блог суреті"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={onRemove}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" /> Жазбаны жою
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// --- Main Admin Page ---
export default function AdminPage() {
  const { data, error, isLoading } = useSWR<DbData>("/api/db", fetcher)
  const [localData, setLocalData] = useState<DbData | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<"topics" | "blog">("topics")

  const dbData = localData || data

  // Sync from SWR to local on first load
  useEffect(() => {
    if (data && !localData) {
      setLocalData({
        topics: data.topics || [],
        blog: data.blog || [],
      })
    }
  }, [data, localData])

  const handleSave = async () => {
    if (!localData) return
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/db", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localData),
      })
      if (!res.ok) throw new Error("Save failed")
      mutate("/api/db", localData, false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      alert("Сақтау қатесі")
    } finally {
      setSaving(false)
    }
  }

  const updateTopic = (index: number, topic: TopicData) => {
    if (!localData) return
    const newTopics = [...localData.topics]
    newTopics[index] = topic
    setLocalData({ ...localData, topics: newTopics })
  }

  const removeTopic = (index: number) => {
    if (!localData) return
    const newTopics = localData.topics.filter((_, i) => i !== index)
    setLocalData({ ...localData, topics: newTopics })
  }

  const addTopic = () => {
    if (!localData) return
    const newTopic: TopicData = {
      id: generateId("topic"),
      title: "",
      description: "",
      icon: "book",
      color: "#4ECDC4",
      lessons: [],
    }
    setLocalData({ ...localData, topics: [...localData.topics, newTopic] })
  }

  const updateBlogPost = (index: number, post: BlogPost) => {
    if (!localData) return
    const newBlog = [...localData.blog]
    newBlog[index] = post
    setLocalData({ ...localData, blog: newBlog })
  }

  const removeBlogPost = (index: number) => {
    if (!localData) return
    const newBlog = localData.blog.filter((_, i) => i !== index)
    setLocalData({ ...localData, blog: newBlog })
  }

  const addBlogPost = () => {
    if (!localData) return
    const newPost: BlogPost = {
      id: generateId("blog"),
      title: "",
      content: "",
      date: new Date().toISOString().split("T")[0],
      image: "",
    }
    setLocalData({ ...localData, blog: [...localData.blog, newPost] })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="font-bold text-muted-foreground">Жүктелуде...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-bold text-destructive">Деректерді жүктеу қатесі</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground transition-colors hover:bg-muted/80"
              aria-label="Басты бет"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-foreground sm:text-2xl">
                Админ панель
              </h1>
              <p className="text-xs font-semibold text-muted-foreground">
                Тақырыптар, сабақтар және блог басқару
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-primary-foreground shadow transition-all hover:scale-105 disabled:opacity-60 ${saved ? "bg-emerald-500" : "bg-primary"}`}
          >
            <Save className="h-4 w-4" />
            {saving ? "Сақталуда..." : saved ? "Сақталды!" : "Сақтау"}
          </button>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("topics")}
            className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all ${
              activeTab === "topics"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Тақырыптар ({dbData?.topics.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("blog")}
            className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all ${
              activeTab === "blog"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <FileText className="h-4 w-4" />
            Блог ({dbData?.blog?.length || 0})
          </button>
        </div>
      </div>

      {/* Content */}
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {activeTab === "topics" && (
          <div className="flex flex-col gap-5">
            {dbData?.topics.map((topic, i) => (
              <TopicEditor
                key={topic.id}
                topic={topic}
                onChange={(t) => updateTopic(i, t)}
                onRemove={() => removeTopic(i)}
              />
            ))}
            <button
              onClick={addTopic}
              className="flex items-center justify-center gap-3 rounded-3xl border-3 border-dashed border-border px-6 py-8 text-lg font-bold text-muted-foreground transition-all hover:border-primary hover:text-primary hover:shadow-md"
            >
              <Plus className="h-6 w-6" /> Жаңа тақырып қосу
            </button>
          </div>
        )}

        {activeTab === "blog" && (
          <div className="flex flex-col gap-5">
            {(dbData?.blog || []).map((post, i) => (
              <BlogPostEditor
                key={post.id}
                post={post}
                onChange={(p) => updateBlogPost(i, p)}
                onRemove={() => removeBlogPost(i)}
              />
            ))}
            <button
              onClick={addBlogPost}
              className="flex items-center justify-center gap-3 rounded-3xl border-3 border-dashed border-border px-6 py-8 text-lg font-bold text-muted-foreground transition-all hover:border-primary hover:text-primary hover:shadow-md"
            >
              <Plus className="h-6 w-6" /> Жаңа блог жазба қосу
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
