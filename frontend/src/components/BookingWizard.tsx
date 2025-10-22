import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StepContent } from './BookingWizardSteps'

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
  // Map team sizes to numbers
  const teamSizeMap: { [key: string]: number } = {
    'solo': 1,
    'duo': 2, 
    'group': 5,
    'gruppe': 5
  }
  
  // Map event types to backend expected values
  const eventTypeMap: { [key: string]: string } = {
    'firmenfeier': 'Firmenfeier',
    'private': 'Private Feier',
    'incentive': 'Incentive',
    'streetshow': 'Streetshow'
  }
  
  // Map duration strings to minutes
  const durationMap: { [key: string]: number } = {
    '5min': 5,
    '10min': 10,
    '15min': 15,
    '30min': 30,
    '45min': 45,
    '60min': 60,
    '90min': 90,
    '120min': 120
  }
  
  // Combine address fields if separate fields are used
  const eventAddress = newData.eventAddress || 
    (newData.street && newData.postalCode && newData.city ? 
      `${newData.street}, ${newData.postalCode} ${newData.city}` : 
      '')

  const parsedCustomDuration = () => {
    const minutes = parseInt(newData.customDuration, 10)
    return Number.isFinite(minutes) && minutes > 0 ? minutes : 30
  }

  return {
    client_email: newData.email,
    client_name: `${newData.firstName} ${newData.lastName}`.trim(),
    disciplines: newData.performanceStyle,
    distance_km: 0, // Could be calculated from address in future
    duration_minutes: durationMap[newData.duration] || parsedCustomDuration(),
    event_address: eventAddress,
    event_date: newData.eventDate,
    event_time: newData.eventTime,
    event_type: eventTypeMap[newData.eventType] || newData.eventType,
    show_type: newData.teamSize,
    is_indoor: newData.venueType === 'indoor',
    needs_light: newData.needsLight,
    needs_sound: newData.needsSound,
    newsletter_opt_in: newData.marketingConsent,
    number_of_guests: parseInt(newData.guestCount) || 0,
    special_requests: newData.message,
    team_size: teamSizeMap[newData.teamSize] || 1,
    planning_status: newData.planningStatus,
    timestamp: new Date().toISOString(),
    source: 'booking-wizard'
  }
}

export default function BookingWizard() {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [formData, setFormData] = useState<BookingData>({
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
  })

  const totalSteps = 7

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

  const teamSizes = [
    {
      value: 'solo',
      label: t('booking.artistCount.options.solo') || 'Solo Performance',
      image: '/images/teamSizes/Solo.webp',
      description: t('about1.cards.solo.b1') || 'Ein Künstler für intime Auftritte'
    },
    {
      value: 'duo', 
      label: t('booking.artistCount.options.duo') || 'Duo Act',
      image: '/images/teamSizes/Duo.webp',
      description: 'Zwei Künstler für dynamische Shows'
    },
    {
      value: 'gruppe',
      label: t('booking.artistCount.options.group') || 'Gruppe',
      image: '/images/teamSizes/Gruppe.webp', 
      description: t('about1.cards.variete.b1') || 'Mehrere Künstler für große Events'
    }
  ]

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
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setServerError(null)
    setRequestId(null)
    
    try {
      // Try multiple endpoints for reliability
      const endpoints = [
        `${import.meta.env.VITE_API_URL || 'https://pepe-backend-4nid.onrender.com'}/api/requests/requests`,
        '/api/requests/requests', // Local fallback
        'https://api.pepe-shows.com/requests/requests' // Alternative endpoint
      ]
      
      let success = false
      let lastError: any = null
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(transformToBackendPayload(formData)),
          })
          
          if (response.ok) {
            success = true
            break
          } else {
            const errorData = await response.text()
            console.warn(`Endpoint ${endpoint} failed:`, response.status, errorData)
            lastError = new Error(`${endpoint}: ${response.status}`)
          }
        } catch (endpointError) {
          console.warn(`Endpoint ${endpoint} error:`, endpointError)
          lastError = endpointError
          continue
        }
      }
      
      if (success) {
        // Store locally as backup
        localStorage.setItem('last-booking-request', JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          status: 'submitted'
        }))
        
        // Reset form to initial state
        setFormData({
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
        })
        setCurrentStep(1)
        alert('Vielen Dank für Ihre detaillierte Anfrage! Wir melden uns innerhalb von 24 Stunden bei Ihnen.')
      } else {
        // Fallback: Store locally and show error with request ID
        const generatedRequestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
        localStorage.setItem('pending-booking-request', JSON.stringify({
          id: generatedRequestId,
          ...formData,
          timestamp: new Date().toISOString(),
          status: 'pending'
        }))
        
        setRequestId(generatedRequestId)
        setServerError('Ihre Anfrage wurde lokal gespeichert. Wir haben technische Probleme mit unserem Server. Bitte kontaktieren Sie uns direkt unter info@pepe-shows.de oder telefonisch.')
        console.error('All endpoints failed. Last error:', lastError)
      }
    } catch (error) {
      console.error('Critical error submitting form:', error)
      const fallbackRequestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      localStorage.setItem('pending-booking-request', JSON.stringify({
        id: fallbackRequestId,
        ...formData,
        timestamp: new Date().toISOString(),
        status: 'error'
      }))
      setRequestId(fallbackRequestId)
      setServerError('Ihre Anfrage wurde lokal gespeichert. Wir haben technische Probleme mit unserem Server. Bitte kontaktieren Sie uns direkt unter info@pepe-shows.de oder telefonisch.')
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
      case 5: return formData.eventDate !== '' && formData.eventTime !== '' && formData.duration !== '' && formData.guestCount !== '' && formData.planningStatus !== ''
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
      choices.push(teamSize?.label || formData.teamSize)
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


  return (
    <div className="booking-wizard">
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

      {/* Error Message Display */}
      {serverError && requestId && (
        <div className="server-error-message mb-8">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <div className="error-details">
              <h4 className="error-title">Technische Probleme</h4>
              <p className="error-text">{serverError}</p>
              <div className="error-request-id">
                <strong>Ihre Anfrage-ID: {requestId}</strong>
              </div>
              <div className="error-actions mt-4">
                <a href="mailto:info@pepe-shows.de" className="btn btn-secondary btn-sm mr-3">
                  E-Mail senden
                </a>
                <a href="tel:+4915904891419" className="btn btn-secondary btn-sm">
                  Anrufen
                </a>
              </div>
            </div>
          </div>
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
