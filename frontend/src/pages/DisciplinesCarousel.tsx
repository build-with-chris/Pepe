import { useState, useEffect } from 'react'
import FloatingDisciplines from '../components/FloatingDisciplines'

interface Discipline {
  id: string
  name: string
  image: string
  description: string
  artistCount: number
}

export default function DisciplinesCarousel() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [loading, setLoading] = useState(true)

  // Map discipline names to icon names for DotCloudImage
  const disciplineToIcon: Record<string, string> = {
    'contemporary dance': 'contemporary',
    'chinese pole': 'pole',
    'cyr-wheel': 'cyrwheel',
    'cyr wheel': 'cyrwheel',
    'hula hoop': 'logo',
    'bodenakrobatik': 'logo',
    'breakdance': 'breakdance',
    'handstand': 'handstand',
    'jonglage': 'juggling',
    'luftakrobatik': 'luftakrobatik',
    'moderation': 'logo',
    'pantomime': 'pantomime',
    'partnerakrobatik': 'partnerakrobatik',
    'zauberer': 'magician',
    'zauberei': 'magician',
    'verantwortung': 'world'
  }

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'https://pepe-backend-4nid.onrender.com'
        const response = await fetch(`${baseUrl}/api/disciplines`)

        if (response.ok) {
          const data = await response.json()
          setDisciplines(data)
        } else {
          console.error('Failed to fetch disciplines')
        }
      } catch (error) {
        console.error('Error fetching disciplines:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDisciplines()
  }, [])

  if (loading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0A0A0A'
      }}>
        <div className="dot-cloud-loader" />
      </div>
    )
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0A0A0A',
      overflow: 'hidden'
    }}>
      <FloatingDisciplines
        disciplines={disciplines}
        disciplineToIcon={disciplineToIcon}
      />
    </div>
  )
}
