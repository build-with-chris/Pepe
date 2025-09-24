import { useState, useEffect } from 'react';
import ProgressBar from '../components/BookingWizard/parts/ProgressBar';
import type { BookingData } from '../components/BookingWizard/types';
import Intro from '../components/BookingWizard/steps/0Intro.tsx';
import StepEventType from '../components/BookingWizard/steps/1StepEventType';
import StepShowType from '../components/BookingWizard/steps/2StepShowType';
import StepShowDisciplines from '../components/BookingWizard/steps/5ShowDisciplines.tsx';
import StepArtistCount from '../components/BookingWizard/steps/3StepArtistCount';
import StepLocation from '../components/BookingWizard/steps/6StepLocation';
import StepDateAndTime from '../components/BookingWizard/steps/7StepDateAndTime';
import StepWishes from '../components/BookingWizard/steps/9StepWishes';
import StepContactDetails from '../components/BookingWizard/steps/10StepContactDetails';
import StepShowtime from '../components/BookingWizard/steps/11StepShowtime';

// Intro is rendered separately (not part of steps)
const steps = [
  StepEventType,
  StepShowType,
  StepShowDisciplines,
  StepArtistCount,
  StepLocation,
  StepDateAndTime,
  StepWishes,
  StepContactDetails,
  StepShowtime
];

export default function Anfragen() {
  // Load saved wizard state from localStorage or use defaults
  const savedData = localStorage.getItem('bookingData');
  const savedStep = localStorage.getItem('bookingStep');
  const initialData: BookingData = savedData
    ? JSON.parse(savedData)
    : {
        client_email: '',
        client_name: '',
        disciplines: [],
        distance_km: 0,
        duration_minutes: 0,
        event_address: '',
        event_date: '',
        event_time: '',
        event_type: '',
        show_type: '',
        is_indoor: false,
        needs_light: false,
        needs_sound: false,
        newsletter_opt_in: false,
        number_of_guests: 0,
        special_requests: '',
        team_size: 0,
        planning_status: ''
      };
  const initialStep = savedStep ? Number(savedStep) : 0;
  const [data, setData] = useState<BookingData>(initialData);
  const [stepIndex, setStepIndex] = useState<number>(initialStep);

  // Persist wizard data and step to localStorage
  useEffect(() => {
    localStorage.setItem('bookingData', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('bookingStep', stepIndex.toString());
  }, [stepIndex]);

  useEffect(() => {
    const handleRestart = () => {
      // jump back to Intro and clear state
      setStepIndex(0);
      setData(initialData);
      try { localStorage.removeItem('bookingStep'); } catch {}
      try { localStorage.removeItem('bookingData'); } catch {}
      try { localStorage.removeItem('bookingTargetArtistId'); } catch {}
      // scroll window to top (or parent scroller if needed)
      try {
        const scroller = document.querySelector('main');
        if (scroller) {
          (scroller as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch {}
    };

    window.addEventListener('booking:reset', handleRestart);
    // Removed: window.addEventListener('booking:submitted', handleRestart);
    return () => {
      window.removeEventListener('booking:reset', handleRestart);
      // Removed: window.removeEventListener('booking:submitted', handleRestart);
    };
  }, []);

  useEffect(() => {
    // If a previous session finished, start fresh when page is revisited
    const completed = localStorage.getItem('bookingCompleted');
    if (completed === 'true') {
      try { localStorage.removeItem('bookingCompleted'); } catch {}
      try { localStorage.removeItem('bookingStep'); } catch {}
      try { localStorage.removeItem('bookingData'); } catch {}
      try { localStorage.removeItem('bookingTargetArtistId'); } catch {}
      setData(initialData);
      setStepIndex(0);
    }
  }, []);

  useEffect(() => {
    // Support starting at a specific step via URL params
    try {
      const params = new URLSearchParams(window.location.search);
      const stepParam = params.get('step');
      const skipIntro = params.get('skipIntro');
      const artistId = params.get('artistId');
      if (artistId) {
        try { localStorage.setItem('bookingTargetArtistId', String(Number(artistId))); } catch {}
      }

      if (stepParam) {
        const s = Math.max(1, Math.min(steps.length, Number(stepParam) || 1));
        setStepIndex(s);
        try { localStorage.setItem('bookingStep', String(s)); } catch {}
        return;
      }

      if (skipIntro === '1' || skipIntro === 'true') {
        setStepIndex(1); // jump to first real step
        try { localStorage.setItem('bookingStep', '1'); } catch {}
      }
    } catch {}
  }, []);
  const CurrentStep = steps[stepIndex - 1];

  const onNext = () => {
    // From Intro (0) -> first real step (1)
    if (stepIndex === 0) {
      setStepIndex(1);
      return;
    }
    // Advance within real steps
    if (stepIndex < steps.length) {
      setStepIndex(stepIndex + 1);
    }
  };

  const onPrev = () => {
    // From first real step back to Intro
    if (stepIndex === 1) {
      setStepIndex(0);
      return;
    }
    if (stepIndex > 1) {
      setStepIndex(stepIndex - 1);
    }
  };

  const onChange = (update: Partial<BookingData>) => {
    setData(prev => ({ ...prev, ...update }));
  };

  return (
    <div className="p-5 relative">
      {stepIndex > 0 && (
        <ProgressBar
          stepIndex={stepIndex - 1}
          totalSteps={steps.length}
          onPrev={onPrev}
          onNext={onNext}
        />
      )}
      {stepIndex === 0 ? (
        <Intro
          onStart={() => setStepIndex(1)}
        />
      ) : (
        <CurrentStep
          data={data}
          onChange={onChange}
          onNext={onNext}
          onPrev={onPrev}
        />
      )}
    </div>
  );
}