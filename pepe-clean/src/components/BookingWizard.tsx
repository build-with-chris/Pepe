import { useState } from 'react'
import { StepContent } from './BookingWizardSteps'

interface BookingData {
  // Step 1: Event Type
  eventType: string
  
  // Step 2: Team Size
  teamSize: string
  
  // Step 3: Performance Style  
  performanceStyle: string
  
  // Step 4: Venue Type
  venueType: string
  
  // Step 5: Event Details
  eventDate: string
  guestCount: string
  budget: string
  
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

export default function BookingWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<BookingData>({
    eventType: '',
    teamSize: '',
    performanceStyle: '',
    venueType: '',
    eventDate: '',
    guestCount: '',
    budget: '',
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

  const stepTitles = [
    'Art der Veranstaltung',
    'Anzahl Künstler', 
    'Performance Stil',
    'Veranstaltungsort',
    'Event Details',
    'Kontaktdaten',
    'Überprüfung & Buchen'
  ]

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
      label: 'Solo Performance',
      image: '/images/teamSizes/Solo.webp',
      description: 'Ein Künstler für intime Auftritte'
    },
    {
      value: 'duo', 
      label: 'Duo Act',
      image: '/images/teamSizes/Duo.webp',
      description: 'Zwei Künstler für dynamische Shows'
    },
    {
      value: 'gruppe',
      label: 'Gruppe',
      image: '/images/teamSizes/Gruppe.webp', 
      description: 'Mehrere Künstler für große Events'
    }
  ]

  const performanceStyles = [
    {
      value: 'zauberer',
      label: 'Zauberei',
      image: '/images/disciplines/Zauberer.webp',
      description: 'Magische Shows & Illusions'
    },
    {
      value: 'akrobatik',
      label: 'Akrobatik', 
      image: '/images/disciplines/Luftakrobatik.webp',
      description: 'Luft- und Bodenakrobatik'
    },
    {
      value: 'tanz',
      label: 'Tanz',
      image: '/images/disciplines/Contemporary_Dance.webp',
      description: 'Contemporary & Breakdance'
    },
    {
      value: 'jonglage',
      label: 'Jonglage',
      image: '/images/disciplines/Jonglage.webp',
      description: 'Artistisches Jonglieren'
    },
    {
      value: 'moderation',
      label: 'Moderation',
      image: '/images/disciplines/Moderation.webp', 
      description: 'Event-Moderation & Entertainment'
    },
    {
      value: 'handstand',
      label: 'Handstand',
      image: '/images/disciplines/Handstand.webp',
      description: 'Kraft & Balance Acts'
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

  const handleInputChange = (field: keyof BookingData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Here you would send to your API
      const response = await fetch('/api/booking-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        alert('Vielen Dank für Ihre detaillierte Anfrage! Wir melden uns innerhalb von 24 Stunden bei Ihnen.')
        // Reset form or redirect
      } else {
        throw new Error('Submission failed')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Es gab einen Fehler beim Senden Ihrer Anfrage. Bitte versuchen Sie es erneut.')
    }
  }

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: return formData.eventType !== ''
      case 2: return formData.teamSize !== ''
      case 3: return formData.performanceStyle !== ''
      case 4: return formData.venueType !== ''
      case 5: return formData.eventDate !== '' && formData.guestCount !== ''
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
    if (formData.performanceStyle) {
      const style = performanceStyles.find(p => p.value === formData.performanceStyle)
      choices.push(style?.label || formData.performanceStyle)
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
      <div className="stepper mb-6">
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
                disabled={!isStepValid(currentStep)}
                className="btn btn-primary btn-xl"
              >
                Anfrage absenden
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}