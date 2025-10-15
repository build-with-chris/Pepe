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
  expandedDiscipline: number
  autoAnimPosition: number
  onDisciplineClick: (index: number) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function FloatingDisciplines({
  disciplines,
  disciplineToIcon,
  expandedDiscipline,
  autoAnimPosition,
  onDisciplineClick,
  onMouseEnter,
  onMouseLeave,
}: FloatingDisciplinesProps) {
  // Filter to only disciplines with icons (excluding 'logo')
  const filteredDisciplines = disciplines.filter(
    d => disciplineToIcon[d.name.toLowerCase()] && disciplineToIcon[d.name.toLowerCase()] !== 'logo'
  )

  return (
    <>
      <div
        className="floating-disciplines"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {filteredDisciplines.map((discipline, index) => (
          <div
            key={discipline.id}
            className={`floating-discipline-item ${index === expandedDiscipline ? 'expanded' : ''}`}
            onMouseEnter={() => onDisciplineClick(index)}
            onClick={() => onDisciplineClick(index)}
          >
            <div className="floating-discipline-content">
              {/* Discipline Name - Always Visible */}
              <h3 className="floating-discipline-name">{discipline.name}</h3>

              {/* DotIcon - 300px wide */}
              <div className="floating-discipline-icon">
                <DotCloudImage
                  disciplineId={disciplineToIcon[discipline.name.toLowerCase()]}
                  size={300}
                  color="var(--pepe-gold)"
                  manualAnimationPosition={index === expandedDiscipline ? autoAnimPosition : 0}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .floating-disciplines {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          max-width: 900px;
          margin: 0 auto;
        }

        .floating-discipline-item {
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .floating-discipline-content {
          display: flex;
          align-items: center;
          gap: var(--space-8);
          padding: var(--space-6) 0;
        }

        .floating-discipline-name {
          font-size: var(--text-2xl);
          font-weight: 500;
          color: var(--pepe-t80);
          min-width: 220px;
          transition: all 0.4s ease;
        }

        .floating-discipline-item.expanded .floating-discipline-name {
          color: var(--pepe-gold);
          font-size: var(--text-3xl);
          font-weight: 600;
        }

        .floating-discipline-icon {
          flex: 1;
          display: flex;
          justify-content: center;
          min-height: 200px;
          transition: all 0.4s ease;
        }

        .floating-discipline-item:not(.expanded) .floating-discipline-icon {
          opacity: 0.3;
          transform: scale(0.8);
        }

        .floating-discipline-item.expanded .floating-discipline-icon {
          opacity: 1;
          transform: scale(1);
        }

        /* Hover states */
        .floating-discipline-item:hover:not(.expanded) .floating-discipline-name {
          color: var(--pepe-gold);
          transform: translateX(8px);
        }

        .floating-discipline-item:hover:not(.expanded) .floating-discipline-icon {
          opacity: 0.5;
          transform: scale(0.85);
        }

        @media (max-width: 768px) {
          .floating-discipline-content {
            flex-direction: column;
            text-align: center;
            gap: var(--space-4);
          }

          .floating-discipline-name {
            min-width: unset;
            font-size: var(--text-xl);
          }

          .floating-discipline-item.expanded .floating-discipline-name {
            font-size: var(--text-2xl);
          }
        }
      `}</style>
    </>
  )
}
