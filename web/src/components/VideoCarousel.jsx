import { useEffect, useRef } from 'react'
import videos from '@/data/videos.json'

export default function VideoCarousel() {
  const containerRef = useRef(null)
  const itemRefs = useRef([])
  const currentIndexRef = useRef(0)
  const scrollLocked = useRef(false)
  const unlockTimer = useRef(null)

  // Dynamically set top/bottom padding so the first and last videos
  // can scroll to the center of the container.
  // padding = (containerHeight - videoHeight) / 2
  // videoHeight = containerWidth * (16/9)  ← derived from aspect ratio
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function updatePadding() {
      const h = container.clientHeight
      const w = container.clientWidth
      const videoH = w * (16 / 9)
      const pad = Math.max(0, (h - videoH) / 2)
      container.style.paddingTop = `${pad}px`
      container.style.paddingBottom = `${pad}px`
    }

    const ro = new ResizeObserver(updatePadding)
    ro.observe(container)
    updatePadding()

    return () => ro.disconnect()
  }, [])

  // Intercept wheel events: scroll one item at a time, lock for 50ms
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function handleWheel(e) {
      e.preventDefault()

      clearTimeout(unlockTimer.current)
      unlockTimer.current = setTimeout(() => {
        scrollLocked.current = false
      }, 50)

      if (scrollLocked.current) return
      scrollLocked.current = true

      const dir = e.deltaY > 0 ? 1 : -1
      const next = Math.max(0, Math.min(videos.length - 1, currentIndexRef.current + dir))
      currentIndexRef.current = next
      itemRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
      clearTimeout(unlockTimer.current)
    }
  }, [])

  function handleClick(index) {
    currentIndexRef.current = index
    itemRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div
      ref={containerRef}
      className="no-scrollbar w-full h-full overflow-y-scroll flex flex-col gap-5"
      style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}
    >
      {videos.map(({ id, src }, index) => (
        <div
          key={id}
          ref={el => itemRefs.current[index] = el}
          className="w-full shrink-0 aspect-[9/16] rounded-[20px] overflow-hidden"
          style={{ scrollSnapAlign: 'center' }}
          onClick={() => handleClick(index)}
        >
          <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain scale-[1.08]"
          />
        </div>
      ))}
    </div>
  )
}
