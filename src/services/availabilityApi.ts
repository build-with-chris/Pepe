export type ISODate = string;

export interface AvailabilitySlot {
  id: string;
  date: ISODate;
  artistId?: string;
}

export interface DeleteAvailabilityParams {
  token: string;
  slotId: string;
  artistId?: string;
}

export const deleteAvailability = async ({ token, slotId, artistId }: DeleteAvailabilityParams): Promise<void> => {
  const baseUrl = import.meta.env.VITE_API_URL as string;
  
  const response = await fetch(`${baseUrl}/api/availability/${slotId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `HTTP ${response.status}`);
  }
};