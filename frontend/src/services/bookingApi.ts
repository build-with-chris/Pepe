import type { BookingData } from '../components/BookingWizard/types';

const BASE_URL = 'https://pepe-backend-4nid.onrender.com/api/requests';

export async function postRequest(data: BookingData): Promise<any> {
  const response = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server-Fehler (${response.status}): ${errorText}`);
  }

  return response.json();
}