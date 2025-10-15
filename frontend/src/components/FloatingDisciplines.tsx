import { useState, useEffect } from 'react'
import DotCloudImage from './ui/DotCloudImage'

interface Discipline {
  id: string
  name: string
  image: string
  description: string
  artistCount: number
}

interface FloatingDisciplinesProps {
  disciplines: Discipline[]
  disciplineToIcon: Record<string, string>
}

export default function FloatingDisciplines({
  disciplines,
  disciplineToIcon,
}: FloatingDisciplinesProps) {
  // Filter to only disciplines with icons (excluding 'logo')
  const filteredDisciplines = disciplines.filter(
    d => disciplineToIcon[d.name.toLowerCase()] && disciplineToIcon[d.name.toLowerCase()] !== 'logo'
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [showName, setShowName] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [animationPosition, setAnimationPosition] = useState(100) // Start at 100 (fully formed)

  // Auto-loop through disciplines
  useEffect(() => {
    if (isPaused || filteredDisciplines.length === 0) return

    const interval = setInterval(() => {
      setShowName(false) // Hide name before transition

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % filteredDisciplines.length)
      }, 400) // Wait for fade out
    }, 5000) // Change discipline every 5 seconds

    return () => clearInterval(interval)
  }, [isPaused, filteredDisciplines.length])

  // Show name with delay after icon starts loading
  useEffect(() => {
    setShowName(false)
    const timer = setTimeout(() => {
      setShowName(true)
    }, 600) // Delay for icon to start appearing
    return () => clearTimeout(timer)
  }, [currentIndex])

  // Animate active icon from 90% to 100% only
  useEffect(() => {
    let animationFrame: number
    const startTime = performance.now()
    const duration = 5000 // 5 seconds total
    const animationStart = 0.9 // Start animation at 90% of timeline
    const animationEnd = 1.0 // End at 100%

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1) // 0 to 1 over 5 seconds

      if (progress < animationStart) {
        // Before 90%: stay at 100 (fully formed, no movement)
        setAnimationPosition(100)
      } else {
        // Between 90-100%: animate from 90 to 100
        const animProgress = (progress - animationStart) / (animationEnd - animationStart)
        const position = 90 + (animProgress * 10) // 90 to 100
        setAnimationPosition(position)
      }

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [currentIndex, isPaused])

  if (filteredDisciplines.length === 0) return null

  const currentDiscipline = filteredDisciplines[currentIndex]
  const iconKey = disciplineToIcon[currentDiscipline.name.toLowerCase()]

  return (
    <>
      <div
        className="floating-disciplines-single"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Single DotIcon - Only ONE loads at a time */}
        <div className="floating-icon-container">
          <DotCloudImage
            key={`${iconKey}-${currentIndex}`}
            disciplineId={iconKey}
            size={300}
            color="var(--pepe-gold)"
            manualAnimationPosition={animationPosition}
          />
        </div>

        {/* Discipline Name - Fades up from bottom */}
        <h3 className={`floating-discipline-label ${showName ? 'visible' : ''}`}>
          {currentDiscipline.name}
        </h3>

        {/* Progress dots */}
        <div className="discipline-dots">
          {filteredDisciplines.map((_, index) => (
            <button
              key={index}
              className={`discipline-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => {
                setShowName(false)
                setTimeout(() => setCurrentIndex(index), 300)
              }}
              aria-label={`Go to ${filteredDisciplines[index].name}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        .floating-disciplines-single {
          max-width: 600px;
          margin: 0 auto;
          padding: var(--space-12) 0;
          position: relative;
        }

        .floating-icon-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 300px;
          height: 300px;
          margin: 0 auto var(--space-6);
        }

        .floating-discipline-label {
          text-align: center;
          font-size: var(--text-4xl);
          font-weight: 600;
          color: var(--pepe-gold);
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .floating-discipline-label.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .discipline-dots {
          display: flex;
          justify-content: center;
          gap: var(--space-2);
          margin-top: var(--space-8);
        }

        .discipline-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--pepe-t40);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .discipline-dot:hover {
          background: var(--pepe-t60);
          transform: scale(1.2);
        }

        .discipline-dot.active {
          background: var(--pepe-gold);
          width: 30px;
          border-radius: 5px;
        }

        @media (max-width: 768px) {
          .floating-discipline-label {
            font-size: var(--text-2xl);
          }

          .floating-icon-container {
            min-height: 250px;
          }
        }
      `}</style>
    </>
  )
}
