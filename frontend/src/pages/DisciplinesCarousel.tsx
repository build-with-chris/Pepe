import FloatingDisciplines from '../components/FloatingDisciplines'

interface Discipline {
  id: string
  name: string
  image: string
  description: string
  artistCount: number
}

export default function DisciplinesCarousel() {
  // All disciplines including Verantwortung
  const disciplines: Discipline[] = [
    { id: '1', name: 'Cyr Wheel', image: '/images/disciplines/Cyr-Wheel.webp', description: 'Spektakuläre Akrobatik im Riesenrad', artistCount: 5 },
    { id: '2', name: 'Jonglage', image: '/images/disciplines/Jonglage.webp', description: 'Meisterhafte Objekt-Manipulation', artistCount: 8 },
    { id: '3', name: 'Zauberer', image: '/images/disciplines/Zauberer.webp', description: 'Magische Illusionen', artistCount: 6 },
    { id: '4', name: 'Breakdance', image: '/images/disciplines/Breakdance.webp', description: 'Urbane Tanzkunst', artistCount: 4 },
    { id: '5', name: 'Handstand', image: '/images/disciplines/Handstand.webp', description: 'Kraft und Balance', artistCount: 7 },
    { id: '6', name: 'Pantomime', image: '/images/disciplines/Pantomime.webp', description: 'Stumme Komödie', artistCount: 3 },
    { id: '7', name: 'Contemporary Dance', image: '/images/disciplines/Contemporary_Dance.webp', description: 'Moderne Choreografie', artistCount: 5 },
    { id: '8', name: 'Partnerakrobatik', image: '/images/disciplines/Partnerakrobatik.webp', description: 'Synchrone Bewegungen', artistCount: 6 },
    { id: '9', name: 'Luftakrobatik', image: '/images/disciplines/Luftakrobatik.webp', description: 'Artistik in der Luft', artistCount: 9 },
    { id: '10', name: 'Chinese Pole', image: '/images/disciplines/Chinese_Pole.webp', description: 'Vertikale Akrobatik', artistCount: 4 },
    { id: '11', name: 'Verantwortung', image: '/images/disciplines/World.webp', description: 'Nachhaltigkeit und soziale Verantwortung', artistCount: 0 },
  ]

  // Map discipline names to icon names for DotCloudImage
  const disciplineToIcon: Record<string, string> = {
    'contemporary dance': 'contemporary',
    'chinese pole': 'pole',
    'cyr-wheel': 'cyrwheel',
    'cyr wheel': 'cyrwheel',
    'hula hoop': 'hulahoop',
    'bodenakrobatik': 'flooracrobatics',
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
