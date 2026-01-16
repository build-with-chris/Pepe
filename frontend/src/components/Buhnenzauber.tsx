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

    // Create particles that float upwards
    const createParticle = (x: number, y: number) => {
      const angle = (Math.random() - 0.5) * 0.5 // Slight horizontal drift
      const speed = Math.random() * 0.5 + 0.3
      const life = Math.random() * 180 + 120 // Longer life: 120-300 frames

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: -Math.abs(Math.random() * 1.5 + 0.5), // Always move upward (negative y)
        size: Math.random() * 4 + 0.5, // Size variation: 0.5 to 4.5
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

      // Create particles around cursor (float upward from cursor position)
      if (Math.random() < 0.6) {
        createParticle(
          mouseX + (Math.random() - 0.5) * 40,
          mouseY + (Math.random() - 0.5) * 20
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

        // Add gentle horizontal drift, maintain upward movement
        particle.vx += (Math.random() - 0.5) * 0.05
        particle.vx *= 0.98
        particle.vy *= 0.995 // Very slight slowdown
        
        // Draw particle
        ctx.save()
        ctx.globalAlpha = particle.opacity * 0.6 // Slightly more visible
        ctx.fillStyle = '#D4A574' // Pepe gold
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        // Add glow effect (stronger for larger particles)
        ctx.shadowBlur = particle.size * 3
        ctx.shadowColor = '#D4A574'
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 0.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
        
        // Remove dead particles
        if (particle.life <= 0) {
          particles.splice(i, 1)
        }
      }

      // Create ambient particles from bottom of screen
      if (Math.random() < 0.15) {
        createParticle(
          Math.random() * canvas.width,
          canvas.height + 10 // Start just below viewport
        )
      }

      // Additional particles from sides
      if (Math.random() < 0.05) {
        createParticle(
          Math.random() < 0.5 ? -10 : canvas.width + 10,
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
        opacity: 0.5
      }}
    />
  )
}