import Link from "next/link"
import Image from "next/image"

const topicImages: Record<string, string> = {
  otbasym: "/images/otbasym.jpg",
  dostarym: "/images/dostarym.jpg",
  kazakhstan: "/images/kazakhstan.jpg",
  ramizder: "/images/ramizder.jpg",
  alfarabi: "/images/alfarabi.jpg",
  tabigat: "/images/tabigat.jpg",
  sayahat: "/images/sayahat.jpg",
}

interface TopicCardProps {
  id: string
  title: string
  description: string
  color: string
  image?: string
}

export function TopicCard({ id, title, description, color, image }: TopicCardProps) {
  const imgSrc = image || topicImages[id] || "/images/otbasym.jpg"
  return (
    <Link href={`/topic/${id}`} className="group block">
      <div
        className="relative overflow-hidden rounded-3xl border-4 border-card shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        style={{ borderColor: color }}
      >
        <div className="relative h-44 w-full overflow-hidden sm:h-52">
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            unoptimized
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${color}ee 0%, ${color}44 50%, transparent 100%)`,
            }}
          />
        </div>
        <div
          className="relative px-5 py-4"
          style={{ backgroundColor: color }}
        >
          <h3 className="text-xl font-extrabold text-white sm:text-2xl">
            {title}
          </h3>
          <p className="mt-1 text-sm font-semibold text-white/90">
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}
