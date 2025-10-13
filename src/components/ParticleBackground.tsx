import { useEffect, useRef } from 'react'

export default function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const particlesRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Create particles
    const particleCount = 30
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      
      // Random size class
      const sizeClass = Math.random() > 0.7 ? 'large' : Math.random() > 0.4 ? '' : 'small'
      
      // Random color class
      const colorClass = Math.random() > 0.7 ? 'bronze' : Math.random() > 0.5 ? 'amber' : Math.random() > 0.3 ? 'copper' : ''
      
      particle.className = `particle ${sizeClass} ${colorClass}`.trim()
      
      // Random position
      particle.style.left = Math.random() * 100 + '%'
      particle.style.animationDelay = Math.random() * 20 + 's'
      particle.style.animationDuration = (15 + Math.random() * 10) + 's'
      
      container.appendChild(particle)
      particlesRef.current.push(particle)
    }

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      
      // Apply repulsion to particles
      particlesRef.current.forEach(particle => {
        const rect = particle.getBoundingClientRect()
        const dx = rect.left + rect.width / 2 - e.clientX
        const dy = rect.top + rect.height / 2 - e.clientY
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 150) {
          particle.classList.add('repelled')
          if (distance < 75) {
            particle.classList.add('dispersed')
          }
        } else {
          particle.classList.remove('repelled', 'dispersed')
        }
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      // Clean up particles
      particlesRef.current.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle)
        }
      })
      particlesRef.current = []
    }
  }, [])

  return (
    <>
      <div className="stage-background" />
      <div ref={containerRef} className="particle-canvas" />
    </>
  )
}