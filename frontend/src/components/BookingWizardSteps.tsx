// import React from 'react' - not needed in modern React
import DotCloudImage from './ui/DotCloudImage'

interface ChoiceCardProps {
  image: string
  label: string
  description: string
  value: string
  selected: boolean
  onSelect: (value: string) => void
  useDotIcon?: boolean
  isActive?: boolean
}

// Map performance style values to doticon names
const dotIconMap: Record<string, string> = {
  'zauberer': 'magician',
  'luftakrobatik': 'luftakrobatik',
  'bodenakrobatik': 'logo', // fallback
  'partnerakrobatik': 'partnerakrobatik',
  'contemporary-dance': 'contemporary',
  'breakdance': 'breakdance',
  'jonglage': 'juggling',
  'pantomime': 'pantomime',
  'cyrwheel': 'cyrwheel',
  'cyr-wheel': 'cyrwheel',
  'handstand': 'handstand',
  'hula-hoop': 'logo', // fallback
  'chinese-pole': 'pole',
  'moderation': 'logo' // fallback
}

export function ChoiceCard({ image, label, description, value, selected, onSelect, useDotIcon, isActive }: ChoiceCardProps) {
  const iconName = dotIconMap[value] || 'logo'

  return (
    <div
      className={`choice-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(value)}
    >
      <div className="choice-card-image">
        {useDotIcon ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <DotCloudImage
              disciplineId={iconName}
              size={300}
              density={0.7}
              color="var(--pepe-gold)"
              sampleGap={1}
              minDotSize={1.9}
              maxDotSize={3.6}
              manualAnimationPosition={undefined}
              aspectRatio={iconName === 'logo' ? 3 : 1}
            />
          </div>
        ) : (
          <img src={image} alt={label} />
        )}
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
  onUpdate: (field: string, value: any) => void
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
                useDotIcon={true}
                isActive={step === 3}
                onSelect={(value) => {
                  const currentStyles = Array.isArray(formData.performanceStyle) ? formData.performanceStyle : []
                  if (currentStyles.includes(value)) {
                    // Remove if already selected
                    onUpdate('performanceStyle', currentStyles.filter((s: string) => s !== value))
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
          
          <div className="location-step-layout-centered">
            {/* Column 1: Venue type selection cards */}
            <div className="venue-selection-section">
              <h4 className="section-title mb-4">Art der Veranstaltung</h4>
              <div className="venue-cards-row-centered">
                {venueTypes.map((venue) => (
                  <div 
                    key={venue.value}
                    className={`venue-card-mini ${formData.venueType === venue.value ? 'selected' : ''}`}
                    onClick={() => onUpdate('venueType', venue.value)}
                  >
                    <div className="venue-card-mini-image">
                      <img src={venue.image} alt={venue.label} />
                    </div>
                    <div className="venue-card-mini-label">{venue.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Address details */}
            <div className="location-address-section">
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
                  className="input calendar-input"
                  value={formData.eventDate}
                  onChange={(e) => onUpdate('eventDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
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
                <div className="duration-selector">
                  <div className="duration-quick-options">
                    <button
                      type="button"
                      className={`duration-btn ${formData.duration === '5min' ? 'active' : ''}`}
                      onClick={() => onUpdate('duration', '5min')}
                    >
                      5 Min
                    </button>
                    <button
                      type="button"
                      className={`duration-btn ${formData.duration === '10min' ? 'active' : ''}`}
                      onClick={() => onUpdate('duration', '10min')}
                    >
                      10 Min
                    </button>
                    <button
                      type="button"
                      className={`duration-btn ${formData.duration === '15min' ? 'active' : ''}`}
                      onClick={() => onUpdate('duration', '15min')}
                    >
                      15 Min
                    </button>
                    <button
                      type="button"
                      className={`duration-btn ${formData.duration === 'custom' ? 'active' : ''}`}
                      onClick={() => onUpdate('duration', 'custom')}
                    >
                      Andere
                    </button>
                  </div>
                  {formData.duration === 'custom' && (
                    <input
                      type="number"
                      className="input mt-3"
                      placeholder="Minuten eingeben..."
                      value={formData.customDuration}
                      onChange={(e) => onUpdate('customDuration', e.target.value)}
                      min="1"
                      max="480"
                    />
                  )}
                </div>
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
                  <span className="summary-label">Team-Größe:</span>
                  <span className="summary-value">
                    {formData.teamSize === 'solo' && 'Solo-Künstler'}
                    {formData.teamSize === 'duo' && 'Duo'}
                    {formData.teamSize === 'group' && 'Gruppe (3+)'}
                    {!formData.teamSize && '-'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Veranstaltungsort:</span>
                  <span className="summary-value">
                    {formData.venueType === 'indoor' && 'Innenveranstaltung'}
                    {formData.venueType === 'outdoor' && 'Außenveranstaltung'}
                    {!formData.venueType && '-'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Datum & Zeit:</span>
                  <span className="summary-value">
                    {formData.eventDate ? 
                      new Date(formData.eventDate).toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'numeric', 
                        year: 'numeric'
                      }) : '-'
                    } {formData.eventTime && `um ${formData.eventTime} Uhr`}
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
                    {Array.isArray(formData.performanceStyle) && formData.performanceStyle.length > 0 ? 
                      formData.performanceStyle.map((styleValue: string) => {
                        const style = performanceStyles.find(p => p.value === styleValue)
                        return style?.label || styleValue
                      }).join(', ') : '-'}
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

            {/* Location Section */}
            {(formData.street || formData.city || formData.postalCode || formData.locationDetails) && (
              <div className="summary-section">
                <h4 className="summary-section-title">📍 Veranstaltungsadresse</h4>
                <div className="summary-grid">
                  {(formData.street || formData.city || formData.postalCode) && (
                    <div className="summary-item full-width">
                      <span className="summary-label">Adresse:</span>
                      <span className="summary-value">
                        {formData.street && formData.street}
                        {formData.street && (formData.postalCode || formData.city) && ', '}
                        {formData.postalCode && formData.postalCode}
                        {formData.postalCode && formData.city && ' '}
                        {formData.city && formData.city}
                      </span>
                    </div>
                  )}
                  {formData.locationDetails && (
                    <div className="summary-item full-width">
                      <span className="summary-label">Zusätzliche Angaben:</span>
                      <span className="summary-value">{formData.locationDetails}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                {!formData.needsLight && !formData.needsSound && (
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
                  )}
                  {formData.planningStatus && (
                    <div className="summary-item">
                      <span className="summary-label">Planungsstand:</span>
                      <span className="summary-value">
                        {formData.planningStatus === 'just_browsing' && 'Schaue mich nur um'}
                        {formData.planningStatus === 'early_planning' && 'Frühe Planungsphase'}
                        {formData.planningStatus === 'in_planning' && 'Konkret in Planung'}
                        {formData.planningStatus === 'urgent' && 'Dringend - Event bald'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Contact Information Section */}
            <div className="summary-section">
              <h4 className="summary-section-title">📧 Kontaktdaten</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Name:</span>
                  <span className="summary-value">
                    {formData.firstName} {formData.lastName}
                  </span>
                </div>
                {formData.company && (
                  <div className="summary-item">
                    <span className="summary-label">Unternehmen:</span>
                    <span className="summary-value">{formData.company}</span>
                  </div>
                )}
                <div className="summary-item">
                  <span className="summary-label">E-Mail:</span>
                  <span className="summary-value">{formData.email}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Telefon:</span>
                  <span className="summary-value">{formData.phone}</span>
                </div>
              </div>
            </div>
            
            {/* Additional Message Section */}
            {formData.message && (
              <div className="summary-section">
                <h4 className="summary-section-title">💬 Zusätzliche Wünsche</h4>
                <p className="summary-message-text">{formData.message}</p>
              </div>
            )}
          </div>
          
          <div className="wizard-terms-summary">
            <p className="text-sm text-pepe-t64">
              Mit dem Absenden Ihrer Anfrage akzeptieren Sie unsere Allgemeinen Geschäftsbedingungen 
              und Datenschutzerklärung. Ihre Anfrage wird vertraulich behandelt.
            </p>
          </div>
        </div>
      )

    default:
      return <div>Invalid step</div>
  }
}