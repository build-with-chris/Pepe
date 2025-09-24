/**
 * Service for gage calculation and criteria management
 */

const baseUrl = import.meta.env.VITE_API_URL;

export interface GageCriteria {
  circus_education: boolean;
  stage_experience: '0-2' | '3-5' | '6-10' | '10+' | null;
  employment_type: 'vollzeit' | 'teilzeit' | 'hobby' | null;
  awards_level: 'international' | 'national' | 'regional' | 'lokal' | 'keine' | null;
  pepe_years: number;
  pepe_exclusivity: boolean;
}

export interface GageInfo {
  calculated_gage: number | null;
  admin_override: number | null;
  current_range: {
    min: number;
    max: number;
  };
}

export interface GageResponse {
  artist_id: number;
  criteria: GageCriteria;
  gage_info: GageInfo;
}

export interface GageCalculationBreakdown {
  total_gage: number;
  base_range: string;
  components: {
    [key: string]: {
      value: string;
      score: number;
      weight: number;
      contribution: number;
    };
  };
}

export class GageService {
  private static getHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Get current gage criteria for the authenticated artist
   */
  static async getMyGageCriteria(token: string): Promise<GageResponse> {
    const response = await fetch(`${baseUrl}/api/artists/me/gage-criteria`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch gage criteria: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update gage criteria for the authenticated artist
   */
  static async updateMyGageCriteria(
    token: string,
    criteria: Partial<GageCriteria>
  ): Promise<{
    message: string;
    artist_id: number;
    calculated_gage: number;
    price_range: { min: number; max: number };
    admin_override: number | null;
  }> {
    const response = await fetch(`${baseUrl}/api/artists/me/gage-criteria`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(criteria),
    });

    if (!response.ok) {
      throw new Error(`Failed to update gage criteria: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get detailed gage calculation breakdown
   */
  static async getMyGageCalculation(token: string): Promise<GageCalculationBreakdown> {
    const response = await fetch(`${baseUrl}/api/artists/me/gage-calculation`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch gage calculation: ${response.statusText}`);
    }

    return response.json();
  }
}

// Helper functions for UI
export const stageExperienceOptions = [
  { value: '0-2', label: '0-2 Jahre' },
  { value: '3-5', label: '3-5 Jahre' },
  { value: '6-10', label: '6-10 Jahre' },
  { value: '10+', label: '10+ Jahre' },
] as const;

export const employmentTypeOptions = [
  { value: 'vollzeit', label: 'Vollzeit' },
  { value: 'teilzeit', label: 'Teilzeit' },
  { value: 'hobby', label: 'Hobby' },
] as const;

export const awardsLevelOptions = [
  { value: 'international', label: 'International' },
  { value: 'national', label: 'National' },
  { value: 'regional', label: 'Regional' },
  { value: 'lokal', label: 'Lokal' },
  { value: 'keine', label: 'Keine' },
] as const;