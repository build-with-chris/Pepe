import type { ReactNode } from 'react'

export interface DisciplineDetail {
  id: string
  title: string
  description: string
  icon?: ReactNode
}

export interface DisciplineAccordionItem {
  id: string
  name: string
  image: string
  description: string
  details?: DisciplineDetail[]
  meta?: string
}

interface DisciplineAccordionProps {
  items: DisciplineAccordionItem[]
  expandedIndex: number
  onToggle: (index: number) => void
  onFocus?: () => void
  onBlur?: () => void
}

export default function DisciplineAccordion({
  items,
  expandedIndex,
  onToggle,
  onFocus,
  onBlur,
}: DisciplineAccordionProps) {
  return (
    <div className="discipline-accordion" onMouseEnter={onFocus} onMouseLeave={onBlur}>
      {items.map((item, index) => {
        const expanded = index === expandedIndex
        return (
          <div
            key={item.id || index}
            className={`discipline-accordion-item ${expanded ? 'expanded' : ''}`}
          >
            <button
              type="button"
              className="discipline-accordion-header"
              onClick={() => onToggle(index)}
              aria-expanded={expanded}
            >
              <div className="discipline-accordion-header-content">
                <div className="discipline-accordion-media-small">
                  <img src={item.image} alt={item.name} loading="lazy" />
                </div>
                <span className="discipline-accordion-name">{item.name}</span>
              </div>
              <span className="discipline-accordion-toggle" aria-hidden="true">
                {expanded ? '–' : '+'}
              </span>
            </button>

            <div className="discipline-accordion-body" aria-hidden={!expanded}>
              <div className="discipline-accordion-content">
                <p className="discipline-description">{item.description}</p>

                {item.details && item.details.length > 0 && (
                  <div className="discipline-detail-grid">
                    {item.details.map((detail) => (
                      <div key={detail.id} className="discipline-detail-item">
                        {detail.icon && <span className="discipline-detail-icon">{detail.icon}</span>}
                        <div>
                          <h4 className="discipline-detail-title">{detail.title}</h4>
                          <p className="discipline-detail-description">{detail.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {item.meta && (
                  <div className="discipline-meta">{item.meta}</div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
