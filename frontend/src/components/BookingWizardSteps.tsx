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
  'bodenakrobatik': 'flooracrobatics',
  'partnerakrobatik': 'partnerakrobatik',
  'contemporary-dance': 'contemporary',
  'breakdance': 'breakdance',
  'jonglage': 'juggling',
  'pantomime': 'pantomime',
  'cyrwheel': 'cyrwheel',
  'cyr-wheel': 'cyrwheel',
  'handstand': 'handstand',
  'hula-hoop': 'hulahoop',
  'chinese-pole': 'pole',
  'moderation': 'moderation'
}

export function ChoiceCard({ image, label, description, value, selected, onSelect, useDotIcon, isActive }: ChoiceCardProps) {
  const iconName = dotIconMap[value] || 'logo'

  return (
    <div
      className={`choice-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(value)}
    >
      <div className="choice-card-image" style={{ opacity: selected ? 1 : 0.5 }}>
        {useDotIcon ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <DotCloudImage
              disciplineId={iconName}
              size={150}
              density={0.25}
              color="var(--pepe-gold)"
              sampleGap={1}
              minDotSize={1.5}
              maxDotSize={4.0}
              manualAnimationPosition={100}
              aspectRatio={iconName === 'logo' ? 3 : 1}
              noGlow={!selected}
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

          <div className="choice-grid choice-grid-three">
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

          {/* Row 1: Art der Veranstaltung - Indoor left, Outdoor right */}
          <div className="venue-selection-section mb-8">
            <h4 className="section-title mb-4 text-center">Art der Veranstaltung</h4>
            <div style={{display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap'}}>
              {venueTypes.map((venue) => (
                <div
                  key={venue.value}
                  className={`venue-card-mini ${formData.venueType === venue.value ? 'selected' : ''}`}
                  onClick={() => onUpdate('venueType', venue.value)}
                  style={{flex: '0 1 250px'}}
                >
                  <div className="venue-card-mini-image">
                    <img src={venue.image} alt={venue.label} />
                  </div>
                  <div className="venue-card-mini-label">{venue.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Veranstaltungsadresse and Technische Anforderungen side by side */}
          <div className="form-row" style={{gap: '2rem', alignItems: 'flex-start'}}>
            {/* Left Column: Veranstaltungsadresse */}
            <div className="location-input-section" style={{flex: 1}}>
              <h4 className="form-section-title mb-4">Veranstaltungsadresse</h4>
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

              <div className="form-field">
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

            {/* Right Column: Technische Anforderungen */}
            <div className="technical-requirements-section" style={{flex: 1}}>
              <h4 className="form-section-title mb-4">Technische Anforderungen</h4>
              <p className="form-helper-text mb-4">
                Wählen Sie aus, welche technische Ausstattung Sie für Ihre Veranstaltung benötigen
              </p>

              <div className="toggle-switches-container">
                {/* Professional Lighting Toggle */}
                <div className="toggle-switch-item">
                  <div className="toggle-switch-content">
                    <div className="toggle-switch-text" style={{textAlign: 'left'}}>
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
                    <div className="toggle-switch-text" style={{textAlign: 'left'}}>
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

          <div className="booking-summary">
            {/* Performance Selection - FULL WIDTH with DotCloud Icons */}
            {Array.isArray(formData.performanceStyle) && formData.performanceStyle.length > 0 && (
              <div className="summary-section-performance">
                <h4>Performance-Auswahl</h4>
                <div className="summary-performance-grid">
                  {formData.performanceStyle.map((styleValue: string) => {
                    const style = performanceStyles.find(p => p.value === styleValue)
                    // Map discipline values to doticon filenames
                    const iconMap: Record<string, string> = {
                      'zauberer': 'magician',
                      'luftakrobatik': 'luftakrobatik',
                      'bodenakrobatik': 'flooracrobatics',
                      'partnerakrobatik': 'partnerakrobatik',
                      'contemporary-dance': 'contemporary',
                      'breakdance': 'breakdance',
                      'jonglage': 'juggling',
                      'hula-hoop': 'hulahoop',
                      'cyr-wheel': 'cyrwheel',
                      'chinese-pole': 'pole',
                      'handstand': 'handstand',
                      'pantomime': 'pantomime',
                      'moderation': 'moderation'
                    }
                    const iconId = iconMap[styleValue] || styleValue

                    // Dynamic icon size based on quantity (1-3: 300px, 4-6: 200px, 7+: 150px)
                    const iconCount = formData.performanceStyle.length
                    const iconSize = iconCount <= 3 ? 300 : iconCount <= 6 ? 200 : 150

                    return style ? (
                      <div key={styleValue} className="performance-icon-item">
                        <DotCloudImage
                          disciplineId={iconId}
                          size={iconSize}
                          color="var(--pepe-gold)"
                          density={0.3}
                          sampleGap={2}
                          minDotSize={1.2}
                          maxDotSize={2.5}
                          manualAnimationPosition={100}
                        />
                        <span>{style.label}</span>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {/* Event Details Section with Venue - Full Width */}
            <div className="summary-section summary-section-full">
              <h4>Veranstaltungsdetails</h4>
              <div className="event-details-with-venue">
                <div className="summary-grid">
                  <div><strong>Veranstaltungsart</strong><span className="summary-value">{eventTypes.find(t => t.value === formData.eventType)?.label || '-'}</span></div>
                  <div><strong>Team-Größe</strong><span className="summary-value">
                    {formData.teamSize === 'solo' && 'Solo-Künstler'}
                    {formData.teamSize === 'duo' && 'Duo'}
                    {formData.teamSize === 'group' && 'Gruppe (3+)'}
                    {!formData.teamSize && '-'}
                  </span></div>
                  <div><strong>Datum & Zeit</strong><span className="summary-value">
                    {formData.eventDate ?
                      new Date(formData.eventDate).toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'numeric',
                        year: 'numeric'
                      }) : '-'
                    } {formData.eventTime && `um ${formData.eventTime} Uhr`}
                  </span></div>
                  <div><strong>Anzahl Gäste</strong><span className="summary-value">{formData.guestCount || '-'} Personen</span></div>
                  <div><strong>Show-Dauer</strong><span className="summary-value">{formData.duration || '-'}</span></div>
                </div>

                {/* Venue thumbnail on right side */}
                {formData.venueType && (
                  <div className="venue-thumbnail-inline">
                    <img
                      src={venueTypes.find(v => v.value === formData.venueType)?.image || '/images/showTypes/Indoor.webp'}
                      alt={venueTypes.find(v => v.value === formData.venueType)?.label || 'Venue'}
                      className="venue-thumbnail-small"
                    />
                    <span className="venue-label">{venueTypes.find(v => v.value === formData.venueType)?.label || '-'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Requirements Section */}
            <div className="summary-section">
              <h4>Technische Anforderungen</h4>
              <div className="summary-grid">
                {formData.needsLight && <div><strong>Beleuchtung</strong><span className="summary-value">Professionelle Beleuchtung erforderlich</span></div>}
                {formData.needsSound && <div><strong>Beschallung</strong><span className="summary-value">Professionelle Beschallung erforderlich</span></div>}
                {formData.needsStageFloor && <div><strong>Bühnenboden</strong><span className="summary-value">Spezial-Bühnenboden erforderlich</span></div>}
                {formData.needsRigging && <div><strong>Rigging</strong><span className="summary-value">Rigging & Aufhängungen erforderlich</span></div>}
                {!formData.needsLight && !formData.needsSound && !formData.needsStageFloor && !formData.needsRigging && (
                  <div><span className="text-pepe-t64">Keine besonderen technischen Anforderungen</span></div>
                )}
              </div>
            </div>

            {/* Budget & Planning Section */}
            {(formData.budget || formData.planningStatus) && (
              <div className="summary-section">
                <h4>Budget & Planung</h4>
                <div className="summary-grid">
                  {formData.budget && (
                    <div><strong>Budgetrahmen</strong><span className="summary-value">{budgetRanges.find(b => b.value === formData.budget)?.label}</span></div>
                  )}
                  {formData.planningStatus && (
                    <div><strong>Planungsstand</strong><span className="summary-value">
                      {formData.planningStatus === 'just_browsing' && 'Schaue mich nur um'}
                      {formData.planningStatus === 'early_planning' && 'Frühe Planungsphase'}
                      {formData.planningStatus === 'in_planning' && 'Konkret in Planung'}
                      {formData.planningStatus === 'urgent' && 'Dringend - Event bald'}
                    </span></div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Message Section */}
            {formData.message && (
              <div className="summary-section summary-section-full">
                <h4>Zusätzliche Wünsche</h4>
                <p className="summary-message-text">{formData.message}</p>
              </div>
            )}

            {/* Contact Information Section */}
            <div className="summary-section">
              <h4>Kontaktdaten</h4>
              <div className="summary-grid">
                <div><strong>Name</strong><span className="summary-value">{formData.firstName} {formData.lastName}</span></div>
                {formData.company && <div><strong>Unternehmen</strong><span className="summary-value">{formData.company}</span></div>}
                <div><strong>E-Mail</strong><span className="summary-value">{formData.email}</span></div>
                <div><strong>Telefon</strong><span className="summary-value">{formData.phone}</span></div>
              </div>
            </div>

            {/* Address Details - after Kontaktdaten */}
            {(formData.street || formData.city || formData.postalCode || formData.eventAddress) && (
              <div className="summary-section">
                <h4>Adresse</h4>
                <div className="summary-grid">
                  <div><strong>Adresse</strong><span className="summary-value">
                    {formData.street && formData.postalCode && formData.city ?
                      `${formData.street}, ${formData.postalCode} ${formData.city}` :
                      formData.eventAddress || '-'
                    }
                  </span></div>
                  {formData.locationDetails && (
                    <div><strong>Zusätzliche Angaben</strong><span className="summary-value">{formData.locationDetails}</span></div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="wizard-terms-container">
            <label className="terms-checkbox-label">
              <input
                type="checkbox"
                checked={formData.termsAccepted || false}
                onChange={(e) => onUpdate('termsAccepted', e.target.checked)}
                required
              />
              <span className="terms-text">
                Ich akzeptiere die{' '}
                <a href="/agb" target="_blank" rel="noopener noreferrer" className="terms-link">
                  Allgemeinen Geschäftsbedingungen
                </a>
                {' '}und die{' '}
                <a href="/datenschutz" target="_blank" rel="noopener noreferrer" className="terms-link">
                  Datenschutzerklärung
                </a>
                . Meine Anfrage wird vertraulich behandelt. *
              </span>
            </label>
          </div>
        </div>
      )

    default:
      return <div>Invalid step</div>
  }
}