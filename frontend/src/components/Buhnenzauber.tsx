import { useEffect, useRef } from 'react'

interface BuhnenzauberProps {
  className?: string
}

export default function Buhnenzauber({ className = '' }: BuhnenzauberProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Animation variables
    let animationId: number
    let mouseX = canvas.width / 2
    let mouseY = canvas.height / 2

    // Particle system
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      life: number
      maxLife: number
    }> = []

    // Create particles
    const createParticle = (x: number, y: number) => {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 2 + 1
      const life = Math.random() * 120 + 60

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1,
        opacity: 1,
        life,
        maxLife: life
      })
    }

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
      
      // Create particles around cursor
      if (Math.random() < 0.3) {
        createParticle(
          mouseX + (Math.random() - 0.5) * 30,
          mouseY + (Math.random() - 0.5) * 30
        )
      }
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i]
        
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy
        
        // Update life
        particle.life--
        particle.opacity = particle.life / particle.maxLife
        
        // Add some drift
        particle.vx *= 0.99
        particle.vy *= 0.99
        particle.vy += 0.02 // slight gravity
        
        // Draw particle
        ctx.save()
        ctx.globalAlpha = particle.opacity * 0.5 // Make particles subtle
        ctx.fillStyle = '#D4A574' // Pepe gold
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        
        // Add glow effect
        ctx.shadowBlur = 10
        ctx.shadowColor = '#D4A574'
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
        
        // Remove dead particles
        if (particle.life <= 0) {
          particles.splice(i, 1)
        }
      }

      // Create ambient particles occasionally
      if (Math.random() < 0.02) {
        createParticle(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        )
      }

      animationId = requestAnimationFrame(animate)
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`buhnenzauber ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
        opacity: 0.5
      }}
    />
  )
}