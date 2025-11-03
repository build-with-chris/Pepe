import { useState, useEffect, useRef } from 'react'
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
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  // Auto-loop through disciplines (2.5 seconds)
  useEffect(() => {
    if (isPaused || filteredDisciplines.length === 0) return

    const interval = setInterval(() => {
      setShowName(false) // Hide name before transition

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % filteredDisciplines.length)
      }, 400) // Wait for fade out
    }, 2500) // Change discipline every 2.5 seconds

    return () => clearInterval(interval)
  }, [isPaused, filteredDisciplines.length])

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swipe left - next
      setShowName(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % filteredDisciplines.length)
      }, 300)
    }

    if (touchEndX.current - touchStartX.current > 50) {
      // Swipe right - previous
      setShowName(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + filteredDisciplines.length) % filteredDisciplines.length)
      }, 300)
    }
  }

  // Show name with delay after icon starts loading
  useEffect(() => {
    setShowName(false)
    const timer = setTimeout(() => {
      setShowName(true)
    }, 600) // Delay for icon to start appearing
    return () => clearTimeout(timer)
  }, [currentIndex])

  // Animate active icon from 90% to 100% only (adjusted for 2.5s)
  useEffect(() => {
    let animationFrame: number
    const startTime = performance.now()
    const duration = 2500 // 2.5 seconds total
    const animationStart = 0.9 // Start animation at 90% of timeline
    const animationEnd = 1.0 // End at 100%

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1) // 0 to 1 over 2.5 seconds

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

  // Responsive icon size
  const getIconSize = () => {
    if (typeof window === 'undefined') return 300
    const width = window.innerWidth
    if (width < 480) return 200 // Small mobile
    if (width < 768) return 250 // Mobile/tablet
    return 300 // Desktop
  }

  return (
    <>
      <div
        className="floating-disciplines-single"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Single DotIcon - Only ONE loads at a time */}
        <div className="floating-icon-container">
          <DotCloudImage
            key={`${iconKey}-${currentIndex}`}
            disciplineId={iconKey}
            size={getIconSize()}
            color={iconKey === 'world' ? '#FFFFFF' : 'var(--pepe-gold)'}
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
          padding: var(--space-8) var(--space-4);
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
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-top: var(--space-8);
          padding: 0 var(--space-4);
          max-width: 100%;
        }

        .discipline-dot {
          /* Minimum touch target: 48x48px for accessibility */
          min-width: 48px;
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          padding: 0;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .discipline-dot::before {
          content: '';
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 215, 0, 0.3);
          transition: all 0.3s ease;
        }

        .discipline-dot:hover::before {
          background: rgba(255, 215, 0, 0.5);
          transform: scale(1.2);
        }

        .discipline-dot.active::before {
          background: var(--pepe-gold);
          width: 30px;
          border-radius: 5px;
        }

        @media (max-width: 768px) {
          .floating-disciplines-single {
            padding: var(--space-6) var(--space-4);
          }

          .floating-icon-container {
            width: 250px;
            height: 250px;
            margin: 0 auto var(--space-4);
          }

          .floating-discipline-label {
            font-size: var(--text-xl);
          }

          .discipline-dots {
            margin-top: var(--space-6);
            gap: var(--space-1);
            padding: 0 var(--space-2);
          }

          .discipline-dot {
            min-width: 36px;
            min-height: 36px;
          }

          .discipline-dot::before {
            width: 8px;
            height: 8px;
          }

          .discipline-dot.active::before {
            width: 20px;
          }
        }

        @media (max-width: 480px) {
          .floating-disciplines-single {
            padding: var(--space-4) var(--space-2);
          }

          .floating-icon-container {
            width: 200px;
            height: 200px;
            margin: 0 auto var(--space-3);
          }

          .floating-discipline-label {
            font-size: var(--text-lg);
          }

          .discipline-dots {
            margin-top: var(--space-4);
            gap: 4px;
            padding: 0 var(--space-2);
          }

          .discipline-dot {
            min-width: 32px;
            min-height: 32px;
          }

          .discipline-dot::before {
            width: 6px;
            height: 6px;
          }

          .discipline-dot.active::before {
            width: 16px;
          }
        }
      `}</style>
    </>
  )
}
