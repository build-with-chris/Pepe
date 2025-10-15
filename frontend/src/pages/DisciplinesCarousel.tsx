import FloatingDisciplines from '../components/FloatingDisciplines'

interface Discipline {
  id: string
  name: string
  image: string
  description: string
  artistCount: number
}

export default function DisciplinesCarousel() {
  // Hardcoded disciplines - API endpoint doesn't exist yet
  const disciplines: Discipline[] = [
    { id: '1', name: 'Cyr Wheel', image: '', description: '', artistCount: 0 },
    { id: '2', name: 'Jonglage', image: '', description: '', artistCount: 0 },
    { id: '3', name: 'Zauberer', image: '', description: '', artistCount: 0 },
    { id: '4', name: 'Breakdance', image: '', description: '', artistCount: 0 },
    { id: '5', name: 'Handstand', image: '', description: '', artistCount: 0 },
    { id: '6', name: 'Pantomime', image: '', description: '', artistCount: 0 },
    { id: '7', name: 'Contemporary Dance', image: '', description: '', artistCount: 0 },
    { id: '8', name: 'Partnerakrobatik', image: '', description: '', artistCount: 0 },
    { id: '9', name: 'Luftakrobatik', image: '', description: '', artistCount: 0 },
    { id: '10', name: 'Chinese Pole', image: '', description: '', artistCount: 0 },
    { id: '11', name: 'Verantwortung', image: '', description: '', artistCount: 0 },
  ]

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
