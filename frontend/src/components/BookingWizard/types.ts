
// Types for Booking Wizard data, matching the backend request schema
export interface BookingData {
  client_email: string;
  client_name: string;
  disciplines: string[];
  distance_km: number;
  duration_minutes: number;
  event_address: string;
  event_date: string;    // Format: YYYY-MM-DD
  event_time: string;    // Format: HH:MM
  event_type: string;
  show_type: string;
  is_indoor: boolean;
  needs_light: boolean;
  needs_sound: boolean;
  newsletter_opt_in: boolean;
  number_of_guests: number;
  special_requests: string;
  team_size: number;
  planning_status: string
}