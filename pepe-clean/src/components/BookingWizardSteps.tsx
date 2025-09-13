import React from 'react'

interface ChoiceCardProps {
  image: string
  label: string
  description: string
  value: string
  selected: boolean
  onSelect: (value: string) => void
}

export function ChoiceCard({ image, label, description, value, selected, onSelect }: ChoiceCardProps) {
  return (
    <div 
      className={`choice-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(value)}
    >
      <div className="choice-card-image">
        <img src={image} alt={label} />
      </div>
      <div className="choice-card-content">
        <h3 className="choice-card-title">{label}</h3>
        <p className="choice-card-description">{description}</p>
      </div>
      <div className="choice-card-indicator">
        <div className="choice-card-check">✓</div>
      </div>
    </div>
  )
}

interface StepContentProps {
  step: number
  formData: any
  onUpdate: (field: string, value: string) => void
  eventTypes: any[]
  teamSizes: any[]
  performanceStyles: any[]
  venueTypes: any[]
  budgetRanges: any[]
}

export function StepContent({ 
  step, 
  formData, 
  onUpdate, 
  eventTypes, 
  teamSizes, 
  performanceStyles, 
  venueTypes, 
  budgetRanges 
}: StepContentProps) {
  switch (step) {
    case 1:
      return (
        <div className="wizard-step">
          <h3 className="wizard-step-title">Welche Art von Veranstaltung planen Sie?</h3>
          <p className="wizard-step-subtitle">Wählen Sie den passenden Event-Typ für Ihre Veranstaltung</p>
          
          <div className="choice-grid">
            {eventTypes.map((type) => (
              <ChoiceCard
                key={type.value}
                image={type.image}
                label={type.label}
                description={type.description}
                value={type.value}
                selected={formData.eventType === type.value}
                onSelect={(value) => onUpdate('eventType', value)}
              />
            ))}
          </div>
        </div>
      )

    case 2:
      return (
        <div className="wizard-step">
          <h3 className="wizard-step-title">Wie viele Künstler möchten Sie buchen?</h3>
          <p className="wizard-step-subtitle">Die Anzahl der Künstler bestimmt das Format Ihrer Show</p>
          
          <div className="choice-grid">
            {teamSizes.map((size) => (
              <ChoiceCard
                key={size.value}
                image={size.image}
                label={size.label}
                description={size.description}
                value={size.value}
                selected={formData.teamSize === size.value}
                onSelect={(value) => onUpdate('teamSize', value)}
              />
            ))}
          </div>
        </div>
      )

    case 3:
      return (
        <div className="wizard-step">
          <h3 className="wizard-step-title">Welcher Performance-Stil gefällt Ihnen?</h3>
          <p className="wizard-step-subtitle">Wählen Sie die Art der Darbietung für Ihr Event</p>
          
          <div className="choice-grid choice-grid-large">
            {performanceStyles.map((style) => (
              <ChoiceCard
                key={style.value}
                image={style.image}
                label={style.label}
                description={style.description}
                value={style.value}
                selected={formData.performanceStyle === style.value}
                onSelect={(value) => onUpdate('performanceStyle', value)}
              />
            ))}
          </div>
        </div>
      )

    case 4:
      return (
        <div className="wizard-step">
          <h3 className="wizard-step-title">Wo findet Ihre Veranstaltung statt?</h3>
          <p className="wizard-step-subtitle">Indoor oder Outdoor - das beeinflusst die Performance-Möglichkeiten</p>
          
          <div className="choice-grid">
            {venueTypes.map((venue) => (
              <ChoiceCard
                key={venue.value}
                image={venue.image}
                label={venue.label}
                description={venue.description}
                value={venue.value}
                selected={formData.venueType === venue.value}
                onSelect={(value) => onUpdate('venueType', value)}
              />
            ))}
          </div>
        </div>
      )

    case 5:
      return (
        <div className="wizard-step">
          <h3 className="wizard-step-title">Details zu Ihrer Veranstaltung</h3>
          <p className="wizard-step-subtitle">Damit wir Ihnen das beste Angebot machen können</p>
          
          <div className="form-compact">
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Datum der Veranstaltung *</label>
                <input
                  type="date"
                  className="input"
                  value={formData.eventDate}
                  onChange={(e) => onUpdate('eventDate', e.target.value)}
                  required
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">Geschätzte Anzahl Gäste *</label>
                <input
                  type="number"
                  className="input"
                  placeholder="z.B. 150"
                  value={formData.guestCount}
                  onChange={(e) => onUpdate('guestCount', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="form-field">
              <label className="form-label">Budgetrahmen</label>
              <select
                className="input"
                value={formData.budget}
                onChange={(e) => onUpdate('budget', e.target.value)}
              >
                <option value="">Bitte wählen...</option>
                {budgetRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )

    case 6:
      return (
        <div className="wizard-step">
          <h3 className="wizard-step-title">Ihre Kontaktdaten</h3>
          <p className="wizard-step-subtitle">Damit wir Ihnen ein individuelles Angebot zusenden können</p>
          
          <div className="form-compact">
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Vorname *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.firstName}
                  onChange={(e) => onUpdate('firstName', e.target.value)}
                  required
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">Nachname *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.lastName}
                  onChange={(e) => onUpdate('lastName', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">E-Mail Adresse *</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={(e) => onUpdate('email', e.target.value)}
                  required
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">Telefonnummer *</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.phone}
                  onChange={(e) => onUpdate('phone', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="form-field">
              <label className="form-label">Unternehmen (optional)</label>
              <input
                type="text"
                className="input"
                placeholder="Falls geschäftlich"
                value={formData.company}
                onChange={(e) => onUpdate('company', e.target.value)}
              />
            </div>
            
            <div className="form-field">
              <label className="form-label">Zusätzliche Wünsche</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Besondere Wünsche, Anforderungen oder Details zu Ihrer Veranstaltung..."
                value={formData.message}
                onChange={(e) => onUpdate('message', e.target.value)}
              />
            </div>
          </div>
        </div>
      )

    case 7:
      return (
        <div className="wizard-step">
          <h3 className="wizard-step-title">Zusammenfassung Ihrer Buchungsanfrage</h3>
          <p className="wizard-step-subtitle">Überprüfen Sie Ihre Angaben vor dem Absenden</p>
          
          <div className="booking-summary-compact">
            <div className="summary-row">
              <div className="summary-item">
                <span className="summary-label">Veranstaltungsart:</span>
                <span className="summary-value">
                  {eventTypes.find(t => t.value === formData.eventType)?.label || '-'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Künstler-Anzahl:</span>
                <span className="summary-value">
                  {teamSizes.find(t => t.value === formData.teamSize)?.label || '-'}
                </span>
              </div>
            </div>
            
            <div className="summary-row">
              <div className="summary-item">
                <span className="summary-label">Performance-Stil:</span>
                <span className="summary-value">
                  {performanceStyles.find(p => p.value === formData.performanceStyle)?.label || '-'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Veranstaltungsort:</span>
                <span className="summary-value">
                  {venueTypes.find(v => v.value === formData.venueType)?.label || '-'}
                </span>
              </div>
            </div>
            
            <div className="summary-row">
              <div className="summary-item">
                <span className="summary-label">Datum:</span>
                <span className="summary-value">{formData.eventDate || '-'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Gäste:</span>
                <span className="summary-value">{formData.guestCount || '-'}</span>
              </div>
            </div>
            
            {formData.budget && (
              <div className="summary-row">
                <div className="summary-item">
                  <span className="summary-label">Budget:</span>
                  <span className="summary-value">
                    {budgetRanges.find(b => b.value === formData.budget)?.label}
                  </span>
                </div>
              </div>
            )}
            
            <div className="summary-contact">
              <h4 className="summary-contact-title">Kontaktdaten</h4>
              <p className="summary-contact-info">
                {formData.firstName} {formData.lastName}
                {formData.company && ` • ${formData.company}`}
              </p>
              <p className="summary-contact-info">
                {formData.email} • {formData.phone}
              </p>
            </div>
            
            {formData.message && (
              <div className="summary-message">
                <h4 className="summary-message-title">Zusätzliche Wünsche</h4>
                <p className="summary-message-text">{formData.message}</p>
              </div>
            )}
          </div>
          
          <div className="wizard-terms">
            <label className="checkbox-label-large">
              <input
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={(e) => onUpdate('termsAccepted', e.target.checked)}
                required
              />
              <span className="checkbox-text">
                Ich akzeptiere die <a href="#" className="link-gold">Allgemeinen Geschäftsbedingungen</a> 
                und die <a href="#" className="link-gold">Datenschutzerklärung</a> *
              </span>
            </label>
            
            <label className="checkbox-label-large">
              <input
                type="checkbox"
                checked={formData.marketingConsent}
                onChange={(e) => onUpdate('marketingConsent', e.target.checked)}
              />
              <span className="checkbox-text">
                Ich möchte über weitere Angebote und Veranstaltungen informiert werden (optional)
              </span>
            </label>
          </div>
        </div>
      )

    default:
      return <div>Invalid step</div>
  }
}