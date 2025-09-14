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
          <p className="wizard-step-subtitle">Wählen Sie eine oder mehrere Arten der Darbietung für Ihr Event</p>
          
          <div className="choice-grid choice-grid-large">
            {performanceStyles.map((style) => (
              <ChoiceCard
                key={style.value}
                image={style.image}
                label={style.label}
                description={style.description}
                value={style.value}
                selected={Array.isArray(formData.performanceStyle) ? formData.performanceStyle.includes(style.value) : formData.performanceStyle === style.value}
                onSelect={(value) => {
                  const currentStyles = Array.isArray(formData.performanceStyle) ? formData.performanceStyle : []
                  if (currentStyles.includes(value)) {
                    // Remove if already selected
                    onUpdate('performanceStyle', currentStyles.filter(s => s !== value))
                  } else {
                    // Add to selection
                    onUpdate('performanceStyle', [...currentStyles, value])
                  }
                }}
              />
            ))}
          </div>
        </div>
      )

    case 4:
      return (
        <div className="wizard-step">
          <h3 className="wizard-step-title">Wo findet Ihre Veranstaltung statt?</h3>
          <p className="wizard-step-subtitle">Veranstaltungsort und technische Anforderungen</p>
          
          <div className="choice-grid mb-8">
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

          <div className="form-compact">
            {/* Enhanced Address Section */}
            <div className="location-input-section">
              <h4 className="form-section-title mb-4">
                <span className="section-icon">📍</span>
                Veranstaltungsadresse
              </h4>
              <div className="form-row mb-4">
                <div className="form-field">
                  <label className="form-label">Straße und Hausnummer *</label>
                  <input
                    type="text"
                    value={formData.street || ''}
                    onChange={(e) => onUpdate('street', e.target.value)}
                    placeholder="z.B. Hauptstraße 123"
                    className="input location-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row mb-6">
                <div className="form-field" style={{flex: '0 0 30%'}}>
                  <label className="form-label">PLZ *</label>
                  <input
                    type="text"
                    value={formData.postalCode || ''}
                    onChange={(e) => onUpdate('postalCode', e.target.value)}
                    placeholder="12345"
                    className="input location-input"
                    maxLength={5}
                    pattern="[0-9]{5}"
                    required
                  />
                </div>
                <div className="form-field" style={{flex: '1'}}>
                  <label className="form-label">Ort *</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => onUpdate('city', e.target.value)}
                    placeholder="z.B. Berlin"
                    className="input location-input"
                    required
                  />
                </div>
              </div>
              
              {/* Optional: Additional location details */}
              <div className="form-field mb-6">
                <label className="form-label">Zusätzliche Ortsangaben (optional)</label>
                <textarea
                  value={formData.locationDetails || ''}
                  onChange={(e) => onUpdate('locationDetails', e.target.value)}
                  placeholder="z.B. Hintereingang, 2. Stock, Saal B"
                  className="input location-textarea"
                  rows={2}
                />
              </div>
            </div>

            {/* Enhanced Technical Requirements Section */}
            <div className="technical-requirements-section">
              <h4 className="form-section-title mb-4">
                <span className="section-icon">⚡</span>
                Technische Anforderungen
              </h4>
              <p className="form-helper-text mb-4">
                Wählen Sie aus, welche technische Ausstattung Sie für Ihre Veranstaltung benötigen
              </p>
              
              <div className="toggle-switches-container">
                {/* Professional Lighting Toggle */}
                <div className="toggle-switch-item">
                  <div className="toggle-switch-content">
                    <div className="toggle-switch-icon">💡</div>
                    <div className="toggle-switch-text">
                      <h5 className="toggle-switch-title">Professionelle Beleuchtung</h5>
                      <p className="toggle-switch-description">
                        Scheinwerfer, Moving Heads, LED-Bars für optimale Bühnenbeleuchtung
                      </p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.needsLight || false}
                      onChange={(e) => onUpdate('needsLight', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                {/* Professional Sound Toggle */}
                <div className="toggle-switch-item">
                  <div className="toggle-switch-content">
                    <div className="toggle-switch-icon">🔊</div>
                    <div className="toggle-switch-text">
                      <h5 className="toggle-switch-title">Professionelle Beschallung</h5>
                      <p className="toggle-switch-description">
                        PA-Anlage, Mikrofone und Mischpult für kristallklaren Sound
                      </p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.needsSound || false}
                      onChange={(e) => onUpdate('needsSound', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                {/* Stage/Floor Toggle */}
                <div className="toggle-switch-item">
                  <div className="toggle-switch-content">
                    <div className="toggle-switch-icon">🎭</div>
                    <div className="toggle-switch-text">
                      <h5 className="toggle-switch-title">Bühnenboden / Tanzboden</h5>
                      <p className="toggle-switch-description">
                        Spezieller Bodenbelag für Tanz- und Akrobatik-Performances
                      </p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.needsStageFloor || false}
                      onChange={(e) => onUpdate('needsStageFloor', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                {/* Rigging Points Toggle */}
                <div className="toggle-switch-item">
                  <div className="toggle-switch-content">
                    <div className="toggle-switch-icon">🎪</div>
                    <div className="toggle-switch-text">
                      <h5 className="toggle-switch-title">Rigging-Punkte / Aufhängung</h5>
                      <p className="toggle-switch-description">
                        Befestigungspunkte für Luftakrobatik und hängende Elemente
                      </p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.needsRigging || false}
                      onChange={(e) => onUpdate('needsRigging', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
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
                <label className="form-label">Uhrzeit der Veranstaltung *</label>
                <input
                  type="time"
                  className="input"
                  value={formData.eventTime}
                  onChange={(e) => onUpdate('eventTime', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Gewünschte Show-Dauer *</label>
                <select
                  className="input"
                  value={formData.duration}
                  onChange={(e) => onUpdate('duration', e.target.value)}
                  required
                >
                  <option value="">Bitte wählen...</option>
                  <option value="15min">15 Minuten</option>
                  <option value="30min">30 Minuten</option>
                  <option value="45min">45 Minuten</option>
                  <option value="60min">60 Minuten</option>
                  <option value="90min">90 Minuten</option>
                  <option value="120min">120 Minuten</option>
                </select>
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
            
            <div className="form-row">
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
              
              <div className="form-field">
                <label className="form-label">Planungsstand *</label>
                <select
                  className="input"
                  value={formData.planningStatus}
                  onChange={(e) => onUpdate('planningStatus', e.target.value)}
                  required
                >
                  <option value="">Bitte wählen...</option>
                  <option value="just_browsing">Schaue mich nur um</option>
                  <option value="early_planning">Frühe Planungsphase</option>
                  <option value="in_planning">Konkret in Planung</option>
                  <option value="urgent">Dringend - Event bald</option>
                </select>
              </div>
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
          
          <div className="booking-summary-enhanced">
            {/* Event Details Section */}
            <div className="summary-section">
              <h4 className="summary-section-title">🎭 Veranstaltungsdetails</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Veranstaltungsart:</span>
                  <span className="summary-value">
                    {eventTypes.find(t => t.value === formData.eventType)?.label || '-'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Datum & Zeit:</span>
                  <span className="summary-value">
                    {formData.eventDate || '-'} {formData.eventTime && `um ${formData.eventTime} Uhr`}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Anzahl Gäste:</span>
                  <span className="summary-value">{formData.guestCount || '-'} Personen</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Show-Dauer:</span>
                  <span className="summary-value">{formData.duration || '-'}</span>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="summary-section">
              <h4 className="summary-section-title">📍 Veranstaltungsort</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Venue-Typ:</span>
                  <span className="summary-value">
                    {venueTypes.find(v => v.value === formData.venueType)?.label || '-'}
                  </span>
                </div>
                <div className="summary-item full-width">
                  <span className="summary-label">Adresse:</span>
                  <span className="summary-value">
                    {formData.street && formData.postalCode && formData.city ? 
                      `${formData.street}, ${formData.postalCode} ${formData.city}` : 
                      formData.eventAddress || '-'
                    }
                  </span>
                </div>
                {formData.locationDetails && (
                  <div className="summary-item full-width">
                    <span className="summary-label">Zusätzliche Angaben:</span>
                    <span className="summary-value">{formData.locationDetails}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Section */}
            <div className="summary-section">
              <h4 className="summary-section-title">🎪 Performance-Auswahl</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Künstler-Anzahl:</span>
                  <span className="summary-value">
                    {teamSizes.find(t => t.value === formData.teamSize)?.label || '-'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Performance-Stil:</span>
                  <span className="summary-value">
                    {performanceStyles.find(p => p.value === formData.performanceStyle)?.label || '-'}
                  </span>
                </div>
                {formData.selectedActs && formData.selectedActs.length > 0 && (
                  <div className="summary-item full-width">
                    <span className="summary-label">Ausgewählte Acts:</span>
                    <span className="summary-value">
                      {formData.selectedActs.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Requirements Section */}
            <div className="summary-section">
              <h4 className="summary-section-title">⚡ Technische Anforderungen</h4>
              <div className="summary-tech-list">
                {formData.needsLight && (
                  <div className="tech-requirement-badge">
                    💡 Professionelle Beleuchtung
                  </div>
                )}
                {formData.needsSound && (
                  <div className="tech-requirement-badge">
                    🔊 Professionelle Beschallung
                  </div>
                )}
                {formData.needsStageFloor && (
                  <div className="tech-requirement-badge">
                    🎭 Bühnenboden / Tanzboden
                  </div>
                )}
                {formData.needsRigging && (
                  <div className="tech-requirement-badge">
                    🎪 Rigging-Punkte
                  </div>
                )}
                {!formData.needsLight && !formData.needsSound && !formData.needsStageFloor && !formData.needsRigging && (
                  <span className="text-pepe-t64">Keine besonderen technischen Anforderungen</span>
                )}
              </div>
            </div>

            {/* Budget & Planning Section */}
            {(formData.budget || formData.planningStatus) && (
              <div className="summary-section">
                <h4 className="summary-section-title">💰 Budget & Planung</h4>
                <div className="summary-grid">
                  {formData.budget && (
                    <div className="summary-item">
                      <span className="summary-label">Budgetrahmen:</span>
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