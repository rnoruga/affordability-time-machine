import { useRef } from 'react'
import videos from '@/data/videos.json'

export default function VideoCarousel() {
  const containerRef = useRef(null)

  function handleClick(e) {
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-scroll"
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {videos.map(({ id, src }) => (
        <div
          key={id}
          className="w-full h-full"
          style={{ scrollSnapAlign: 'start' }}
          onClick={handleClick}
        >
          <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  )
}
