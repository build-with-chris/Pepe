import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  GageService,
  stageExperienceOptions,
  employmentTypeOptions,
  awardsLevelOptions
} from '@/services/gageService';
import type { GageCriteria, GageResponse } from '@/services/gageService';
import { Calculator, Euro, Info } from 'lucide-react';

interface GageCriteriaFormProps {
  onGageUpdate?: (gageInfo: { min: number; max: number; calculated: number }) => void;
}

export function GageCriteriaForm({ onGageUpdate }: GageCriteriaFormProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const [criteria, setCriteria] = useState<GageCriteria>({
    circus_education: false,
    stage_experience: null,
    employment_type: null,
    awards_level: null,
    pepe_years: 0,
    pepe_exclusivity: false,
  });

  const [gageInfo, setGageInfo] = useState<{
    calculated: number | null;
    min: number;
    max: number;
    adminOverride: number | null;
  }>({
    calculated: null,
    min: 0,
    max: 0,
    adminOverride: null,
  });

  const [breakdown, setBreakdown] = useState<any>(null);

  // Load current criteria on mount
  useEffect(() => {
    loadCriteria();
  }, [token]);

  const loadCriteria = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await GageService.getMyGageCriteria(token);
      setCriteria(response.criteria);
      setGageInfo({
        calculated: response.gage_info.calculated_gage,
        min: response.gage_info.current_range.min,
        max: response.gage_info.current_range.max,
        adminOverride: response.gage_info.admin_override,
      });
    } catch (err) {
      console.error('Failed to load gage criteria:', err);
      setError('Fehler beim Laden der Gage-Kriterien');
    } finally {
      setLoading(false);
    }
  };

  const updateCriteria = async (updates: Partial<GageCriteria>) => {
    if (!token) return;

    setSaving(true);
    setError(null);

    try {
      const response = await GageService.updateMyGageCriteria(token, updates);

      // Update local state
      setCriteria(prev => ({ ...prev, ...updates }));
      setGageInfo({
        calculated: response.calculated_gage,
        min: response.price_range.min,
        max: response.price_range.max,
        adminOverride: response.admin_override,
      });

      // Notify parent component
      if (onGageUpdate) {
        onGageUpdate({
          min: response.price_range.min,
          max: response.price_range.max,
          calculated: response.calculated_gage,
        });
      }
    } catch (err) {
      console.error('Failed to update gage criteria:', err);
      setError('Fehler beim Speichern der Kriterien');
    } finally {
      setSaving(false);
    }
  };

  const loadBreakdown = async () => {
    if (!token) return;

    try {
      const breakdownData = await GageService.getMyGageCalculation(token);
      setBreakdown(breakdownData);
      setShowBreakdown(true);
    } catch (err) {
      console.error('Failed to load breakdown:', err);
      setError('Fehler beim Laden der Berechnung');
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-400">Lade Gage-Kriterien...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-gray-800 bg-gray-900 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Gage-Berechnung
        </h2>
        <button
          onClick={loadBreakdown}
          className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          <Info className="w-4 h-4" />
          Details anzeigen
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Current Gage Display */}
      {gageInfo.calculated && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Berechnete Gage</p>
              <p className="text-2xl font-bold text-white flex items-center gap-1">
                <Euro className="w-6 h-6" />
                {gageInfo.calculated}
              </p>
              <p className="text-sm text-gray-400">
                Spanne: {gageInfo.min}€ - {gageInfo.max}€
              </p>
            </div>
            {gageInfo.adminOverride && (
              <div className="text-right">
                <p className="text-sm text-orange-400">Admin Override</p>
                <p className="text-lg font-semibold text-orange-300">
                  {gageInfo.adminOverride}€
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Zirkusausbildung */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={criteria.circus_education}
              onChange={(e) => updateCriteria({ circus_education: e.target.checked })}
              disabled={saving}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="font-medium text-gray-300">
              Staatlich anerkannte Zirkusschule
            </span>
          </label>
          <p className="mt-1 text-sm text-gray-400 ml-6">
            Ausbildung an einer staatlich anerkannten Einrichtung
          </p>
        </div>

        {/* Bühnenerfahrung */}
        <div>
          <label className="mb-1 block font-medium text-gray-300">Bühnenerfahrung</label>
          <select
            value={criteria.stage_experience || ''}
            onChange={(e) => updateCriteria({
              stage_experience: e.target.value as any || null
            })}
            disabled={saving}
            className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white"
          >
            <option value="">Nicht angegeben</option>
            {stageExperienceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Beschäftigungsart */}
        <div>
          <label className="mb-1 block font-medium text-gray-300">Beschäftigungsart</label>
          <select
            value={criteria.employment_type || ''}
            onChange={(e) => updateCriteria({
              employment_type: e.target.value as any || null
            })}
            disabled={saving}
            className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white"
          >
            <option value="">Nicht angegeben</option>
            {employmentTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Auszeichnungen */}
        <div>
          <label className="mb-1 block font-medium text-gray-300">Auszeichnungen</label>
          <select
            value={criteria.awards_level || ''}
            onChange={(e) => updateCriteria({
              awards_level: e.target.value as any || null
            })}
            disabled={saving}
            className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white"
          >
            <option value="">Nicht angegeben</option>
            {awardsLevelOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Pepe Jahre */}
        <div>
          <label className="mb-1 block font-medium text-gray-300">Jahre bei Pepe</label>
          <input
            type="number"
            min={0}
            value={criteria.pepe_years}
            onChange={(e) => updateCriteria({
              pepe_years: Math.max(0, parseInt(e.target.value) || 0)
            })}
            disabled={saving}
            className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white"
          />
        </div>

        {/* Pepe Exklusivität */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={criteria.pepe_exclusivity}
              onChange={(e) => updateCriteria({ pepe_exclusivity: e.target.checked })}
              disabled={saving}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="font-medium text-gray-300">
              Exklusiv für Pepe
            </span>
          </label>
          <p className="mt-1 text-sm text-gray-400 ml-6">
            Arbeite nur über die Pepe-Agentur
          </p>
        </div>
      </div>

      {saving && (
        <div className="mt-4 text-center text-blue-400">
          <div className="inline-flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            Speichere...
          </div>
        </div>
      )}

      {/* Breakdown Modal */}
      {showBreakdown && breakdown && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Gage-Berechnung Details</h3>
                <button
                  onClick={() => setShowBreakdown(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg">
                  <p className="text-2xl font-bold text-white">{breakdown.total_gage}€</p>
                  <p className="text-sm text-gray-400">Berechnete Gage</p>
                  <p className="text-xs text-gray-500">Basis: {breakdown.base_range}</p>
                </div>

                <div className="space-y-3">
                  {Object.entries(breakdown.components).map(([key, data]: [string, any]) => (
                    <div key={key} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-white">{getComponentLabel(key)}</p>
                          <p className="text-sm text-gray-400">{data.value}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white">{(data.contribution * 100).toFixed(1)}%</p>
                          <p className="text-xs text-gray-400">
                            {data.score} × {(data.weight * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Helper function for component labels
function getComponentLabel(key: string): string {
  const labels: Record<string, string> = {
    stage_experience: 'Bühnenerfahrung',
    circus_education: 'Zirkusausbildung',
    employment_type: 'Beschäftigungsart',
    awards_level: 'Auszeichnungen',
    pepe_commitment: 'Pepe-Commitment',
  };
  return labels[key] || key;
}