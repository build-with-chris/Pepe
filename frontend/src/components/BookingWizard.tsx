import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { StepContent, ResultStep, type BookingResult } from './BookingWizardSteps'
import { getApiBaseUrl } from '@/lib/apiBase'
import {
  TEAM_SIZES,
  TEAM_SIZE_LABELS,
  TEAM_SIZE_PEOPLE,
  durationMinutes,
  type TeamSize,
} from '@/constraints/booking'

interface BookingData {
  // Step 1: Event Type
  eventType: string
  
  // Step 2: Team Size
  teamSize: string
  
  // Step 3: Performance Style  
  performanceStyle: string[]
  
  // Step 4: Venue Type & Technical
  venueType: string
  eventAddress: string
  street: string
  postalCode: string
  city: string
  locationDetails: string
  needsLight: boolean
  needsSound: boolean
  needsStageFloor: boolean
  needsRigging: boolean
  
  // Step 5: Event Details
  eventDate: string
  eventTime: string
  duration: string
  customDuration: string
  guestCount: string
  budget: string
  planningStatus: string
  
  // Step 6: Contact Information
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  message: string
  
  // Step 7: Review & Submit
  termsAccepted: boolean
  marketingConsent: boolean
}

// Backend expects different field structure - transform new format to old
function transformToBackendPayload(newData: BookingData) {
  // Map event types to backend expected values
  const eventTypeMap: { [key: string]: string } = {
    'firmenfeier': 'Firmenfeier',
    'private': 'Private Feier',
    'incentive': 'Incentive',
    'streetshow': 'Streetshow'
  }

  // Combine address fields if separate fields are used
  const eventAddress = newData.eventAddress ||
    (newData.street && newData.postalCode && newData.city ?
      `${newData.street}, ${newData.postalCode} ${newData.city}` :
      '')

  return {
    client_email: newData.email,
    client_name: `${newData.firstName} ${newData.lastName}`.trim(),
    // Telefonnummer, Unternehmen, Budget und Ortshinweise standen im Formular
    // schon drin, wurden aber nie mitgeschickt. Bei der Telefonnummer war das
    // besonders unschön: ein Pflichtfeld, das niemand je zu sehen bekam.
    client_phone: newData.phone,
    client_company: newData.company,
    disciplines: newData.performanceStyle,
    // distance_km wird bewusst nicht mitgeschickt — der Server berechnet die
    // Entfernung aus Event-Adresse und Künstler-Koordinaten.
    duration_minutes: durationMinutes(newData.duration, newData.customDuration),
    event_address: eventAddress,
    location_details: newData.locationDetails,
    event_date: newData.eventDate,
    event_time: newData.eventTime,
    event_type: eventTypeMap[newData.eventType] || newData.eventType,
    show_type: newData.teamSize,
    is_indoor: newData.venueType === 'indoor',
    needs_light: newData.needsLight,
    needs_sound: newData.needsSound,
    needs_stage_floor: newData.needsStageFloor,
    needs_rigging: newData.needsRigging,
    newsletter_opt_in: newData.marketingConsent,
    number_of_guests: parseInt(newData.guestCount) || 0,
    special_requests: newData.message,
    team_size: TEAM_SIZE_PEOPLE[newData.teamSize as TeamSize] || 1,
    budget_range: newData.budget,
    planning_status: newData.planningStatus,
    timestamp: new Date().toISOString(),
    source: 'booking-wizard'
  }
}

const EMPTY_FORM_DATA: BookingData = {
  eventType: '',
  teamSize: '',
  performanceStyle: [],
  venueType: '',
  eventAddress: '',
  street: '',
  postalCode: '',
  city: '',
  locationDetails: '',
  needsLight: false,
  needsSound: false,
  needsStageFloor: false,
  needsRigging: false,
  eventDate: '',
  eventTime: '',
  duration: '',
  customDuration: '',
  guestCount: '',
  budget: '',
  planningStatus: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  message: '',
  termsAccepted: false,
  marketingConsent: false
}

const SUBMIT_ERROR_TEXT =
  'Wir haben gerade technische Probleme. Ihre Angaben sind lokal gespeichert. ' +
  'Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.'

export default function BookingWizard() {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<BookingResult | null>(null)
  const wizardRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState<BookingData>(EMPTY_FORM_DATA)
  // Schlüssel für genau diese Anfrage. Er bleibt über Fehlversuche hinweg
  // gleich, damit ein zweiter Anlauf keine zweite Anfrage anlegt, und wird nach
  // einem erfolgreichen Absenden verworfen.
  const idempotencyKey = useRef<string | null>(null)

  const totalSteps = 7

  // Scroll to top of wizard on step change and when the result appears
  useEffect(() => {
    if (wizardRef.current) {
      wizardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [currentStep, result])

  const eventTypes = [
    { 
      value: 'firmenfeier', 
      label: 'Firmenfeier', 
      image: '/images/eventTypes/Firmenfeier.webp',
      description: 'Corporate Events & Firmenfeiern'
    },
    { 
      value: 'private', 
      label: 'Private Feier', 
      image: '/images/eventTypes/Private_Feier.webp',
      description: 'Geburtstage & Private Anlässe'
    },
    { 
      value: 'incentive', 
      label: 'Incentive Event', 
      image: '/images/eventTypes/Incentive.webp',
      description: 'Mitarbeiter-Incentives & Belohnungen'
    },
    { 
      value: 'streetshow', 
      label: 'Street Performance', 
      image: '/images/eventTypes/Streetshow.webp',
      description: 'Straßenkünste & öffentliche Events'
    }
  ]

  // Reihenfolge und Werte kommen aus TEAM_SIZES, damit sie nicht von der
  // Zusammenfassung abweichen können.
  const teamSizeDetails: Record<TeamSize, { label: string; image: string; description: string }> = {
    solo: {
      label: t('booking.artistCount.options.solo') || 'Solo Performance',
      image: '/images/teamSizes/Solo.webp',
      description: t('about1.cards.solo.b1') || 'Ein Künstler für intime Auftritte'
    },
    duo: {
      label: t('booking.artistCount.options.duo') || 'Duo Act',
      image: '/images/teamSizes/Duo.webp',
      description: 'Zwei Künstler für dynamische Shows'
    },
    gruppe: {
      label: t('booking.artistCount.options.group') || 'Gruppe',
      image: '/images/teamSizes/Gruppe.webp',
      description: t('about1.cards.variete.b1') || 'Mehrere Künstler für große Events'
    }
  }
  const teamSizes = TEAM_SIZES.map(value => ({ value, ...teamSizeDetails[value] }))

  const performanceStyles = [
    {
      value: 'zauberer',
      label: t('booking.disciplines.options.zauberer.label') || 'Zauberei',
      image: '/images/disciplines/Zauberer.webp',
      description: t('booking.disciplines.options.zauberer.description') || 'Magische Shows & Illusions'
    },
    {
      value: 'luftakrobatik',
      label: t('booking.disciplines.options.luftakrobatik.label') || 'Luftakrobatik',
      image: '/images/disciplines/Luftakrobatik.webp',
      description: t('booking.disciplines.options.luftakrobatik.description') || 'Aerial & Luftartistik'
    },
    {
      value: 'bodenakrobatik',
      label: t('booking.disciplines.options.bodenakrobatik.label') || 'Bodenakrobatik',
      image: '/images/disciplines/Bodenakrobatik.webp',
      description: t('booking.disciplines.options.bodenakrobatik.description') || 'Floor Acrobatics & Turnen'
    },
    {
      value: 'partnerakrobatik',
      label: t('booking.disciplines.options.partnerakrobatik.label') || 'Partnerakrobatik',
      image: '/images/disciplines/Partnerakrobatik.webp',
      description: t('booking.disciplines.options.partnerakrobatik.description') || 'Partner Acrobatics & Hand-to-Hand'
    },
    {
      value: 'contemporary-dance',
      label: t('booking.disciplines.options.contemporaryDance.label') || 'Contemporary Dance',
      image: '/images/disciplines/Contemporary_Dance.webp',
      description: t('booking.disciplines.options.contemporaryDance.description') || 'Moderner Tanz & Choreographie'
    },
    {
      value: 'breakdance',
      label: t('booking.disciplines.options.breakdance.label') || 'Breakdance',
      image: '/images/disciplines/Breakdance.webp',
      description: t('booking.disciplines.options.breakdance.description') || 'Urban Dance & Hip-Hop'
    },
    {
      value: 'jonglage',
      label: t('booking.disciplines.options.jonglage.label') || 'Jonglage',
      image: '/images/disciplines/Jonglage.webp',
      description: t('booking.disciplines.options.jonglage.description') || 'Artistisches Jonglieren'
    },
    {
      value: 'chinese-pole',
      label: t('booking.disciplines.options.chinesePole.label') || 'Chinese Pole',
      image: '/images/disciplines/Chinese_Pole.webp',
      description: t('booking.disciplines.options.chinesePole.description') || 'Vertikale Artistik am Mast'
    },
    {
      value: 'cyr-wheel',
      label: t('booking.disciplines.options.cyrWheel.label') || 'Cyr Wheel',
      image: '/images/disciplines/Cyr-Wheel.webp',
      description: t('booking.disciplines.options.cyrWheel.description') || 'Artistik im großen Rad'
    },
    {
      value: 'hula-hoop',
      label: t('booking.disciplines.options.hulaHoop.label') || 'Hula Hoop',
      image: '/images/disciplines/Hula_Hoop.webp',
      description: t('booking.disciplines.options.hulaHoop.description') || 'Artistisches Hula-Hoop'
    },
    {
      value: 'handstand',
      label: t('booking.disciplines.options.handstand.label') || 'Handstand',
      image: '/images/disciplines/Handstand.webp',
      description: t('booking.disciplines.options.handstand.description') || 'Kraft & Balance Acts'
    },
    {
      value: 'moderation',
      label: t('booking.disciplines.options.moderation.label') || 'Moderation',
      image: '/images/disciplines/Moderation.webp',
      description: t('booking.disciplines.options.moderation.description') || 'Event-Moderation & Entertainment'
    },
    {
      value: 'pantomime',
      label: t('booking.disciplines.options.pantomimeEntertainment.label') || 'Pantomime',
      image: '/images/disciplines/Pantomime/Entertainment.webp',
      description: t('booking.disciplines.options.pantomimeEntertainment.description') || 'Stumme Kunst & Entertainment'
    }
  ]

  const venueTypes = [
    {
      value: 'indoor',
      label: 'Indoor Event',
      image: '/images/bookingagent/BW/Indoor.webp',
      description: 'Hotels, Hallen & Innenräume'
    },
    {
      value: 'outdoor', 
      label: 'Outdoor Event',
      image: '/images/bookingagent/BW/Outdoor.webp',
      description: 'Freiluft & Straßenveranstaltungen'
    }
  ]

  const budgetRanges = [
    { value: '500-1000', label: '500 - 1.000 €' },
    { value: '1000-2500', label: '1.000 - 2.500 €' },
    { value: '2500-5000', label: '2.500 - 5.000 €' },
    { value: '5000-10000', label: '5.000 - 10.000 €' },
    { value: '10000+', label: 'über 10.000 €' },
    { value: 'flexible', label: 'Flexibel/Beratung' }
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const failWith = (error: unknown) => {
    console.error('Booking request failed:', error)
    localStorage.setItem('pending-booking-request', JSON.stringify({
      ...formData,
      timestamp: new Date().toISOString(),
      status: 'error'
    }))
    setResult({
      status: 'error',
      requestId: null,
      priceMin: null,
      priceMax: null,
      reason: null,
      numArtists: 0,
      disciplines: formData.performanceStyle,
      errorMessage: SUBMIT_ERROR_TEXT
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Backend-URL kommt ausschliesslich aus der Umgebung. Ein hartkodierter
      // Hoster als Fallback laesst eine falsch konfigurierte Umgebung
      // unbemerkt gegen die falsche Instanz laufen. Ein leerer Wert ist dagegen
      // gueltig und heisst "gleiche Herkunft" — der Normalfall, wenn Frontend
      // und Backend als zwei Services unter einer Domain liegen.
      const baseUrl = getApiBaseUrl()

      if (!idempotencyKey.current) {
        idempotencyKey.current = crypto.randomUUID()
      }

      const response = await fetch(`${baseUrl}/api/requests/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Der Server erkennt daran einen zweiten Anlauf derselben Anfrage und
          // gibt die erste Antwort zurück, statt eine Dublette anzulegen.
          'Idempotency-Key': idempotencyKey.current,
        },
        body: JSON.stringify(transformToBackendPayload(formData)),
      })

      if (!response.ok) {
        failWith(new Error(`${response.status} ${await response.text()}`))
        return
      }

      const data = await response.json()

      // Store locally as backup
      localStorage.setItem('last-booking-request', JSON.stringify({
        ...formData,
        requestId: data.request_id ?? null,
        timestamp: new Date().toISOString(),
        status: 'submitted'
      }))

      setResult({
        // Ältere Backends kennen price_status noch nicht — dann aus den Preisen ableiten.
        status: data.price_status ?? (data.price_min != null ? 'range' : 'unavailable'),
        requestId: data.request_id ?? null,
        priceMin: data.price_min ?? null,
        priceMax: data.price_max ?? null,
        reason: data.price_reason ?? null,
        numArtists: data.num_available_artists ?? 0,
        disciplines: formData.performanceStyle
      })

      // Die Anfrage ist durch: der nächste Absendeversuch ist eine neue.
      idempotencyKey.current = null
      setFormData(EMPTY_FORM_DATA)
      setCurrentStep(1)
    } catch (error) {
      failWith(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: return formData.eventType !== ''
      case 2: return formData.teamSize !== ''
      case 3: return formData.performanceStyle.length > 0
      case 4: return formData.venueType !== '' && (formData.eventAddress !== '' || (formData.street !== '' && formData.postalCode !== '' && formData.city !== ''))
      // Die Dauer zählt erst als angegeben, wenn sich Minuten daraus ergeben.
      // Nur auf `duration !== ''` zu prüfen liess "Andere" ohne Minutenangabe
      // durch, und der Kunde bekam still einen Preis für 30 Minuten genannt.
      case 5: return formData.eventDate !== '' && formData.eventTime !== '' &&
        durationMinutes(formData.duration, formData.customDuration) !== null &&
        formData.guestCount !== '' && formData.planningStatus !== ''
      case 6: return formData.firstName !== '' && formData.lastName !== '' && formData.email !== '' && formData.phone !== ''
      case 7: return formData.termsAccepted
      default: return true
    }
  }

  const getCompletedChoices = () => {
    const choices = []
    if (formData.eventType) {
      const eventType = eventTypes.find(t => t.value === formData.eventType)
      choices.push(eventType?.label || formData.eventType)
    }
    if (formData.teamSize) {
      const teamSize = teamSizes.find(t => t.value === formData.teamSize)
      choices.push(teamSize?.label || TEAM_SIZE_LABELS[formData.teamSize as TeamSize] || formData.teamSize)
    }
    if (formData.performanceStyle && formData.performanceStyle.length > 0) {
      const selectedStyles = formData.performanceStyle.map(styleValue => {
        const style = performanceStyles.find(p => p.value === styleValue)
        return style?.label || styleValue
      }).join(', ')
      choices.push(selectedStyles)
    }
    if (formData.venueType) {
      const venue = venueTypes.find(v => v.value === formData.venueType)
      choices.push(venue?.label || formData.venueType)
    }
    if (formData.eventDate) {
      choices.push(new Date(formData.eventDate).toLocaleDateString('de-DE'))
    }
    if (formData.guestCount) {
      choices.push(`${formData.guestCount} Gäste`)
    }
    return choices
  }


  if (result) {
    return (
      <div ref={wizardRef} className="booking-wizard">
        <ResultStep result={result} onRestart={() => setResult(null)} />
      </div>
    )
  }

  return (
    <div ref={wizardRef} className="booking-wizard">
      {/* Stepper */}
      <div className="stepper mb-6" style={{ maxWidth: 'none', width: '100%' }}>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className={`stepper-dot ${step <= currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
          >
            <div className="stepper-number">{step}</div>
          </div>
        ))}
      </div>
      
      {/* Breadcrumb */}
      {getCompletedChoices().length > 0 && (
        <div className="booking-breadcrumb mb-8">
          {getCompletedChoices().map((choice, index) => (
            <span key={index} className="breadcrumb-item">
              {choice}
              {index < getCompletedChoices().length - 1 && <span className="breadcrumb-separator"> → </span>}
            </span>
          ))}
        </div>
      )}

      {/* Step Content */}
      <form onSubmit={handleSubmit}>
        <div className="wizard-content">
          <StepContent
            step={currentStep}
            formData={formData}
            onUpdate={handleInputChange}
            eventTypes={eventTypes}
            teamSizes={teamSizes}
            performanceStyles={performanceStyles}
            venueTypes={venueTypes}
            budgetRanges={budgetRanges}
          />
        </div>

        {/* Navigation */}
        <div className="wizard-navigation">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="btn btn-secondary btn-lg"
            >
              Zurück
            </button>
          )}
          
          <div className="wizard-nav-right">
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="btn btn-primary btn-lg"
              >
                Weiter
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isStepValid(currentStep) || isSubmitting}
                className="btn btn-primary btn-xl"
              >
                {isSubmitting ? 'Wird gesendet...' : 'Anfrage absenden'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
