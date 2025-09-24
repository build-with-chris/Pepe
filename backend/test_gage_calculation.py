#!/usr/bin/env python3
"""
Test script for gage calculation system.
Run this to test different artist scenarios.
"""

from services.gage_calculator import GageCalculator

# Mock Artist class for testing
class MockArtist:
    def __init__(self, **kwargs):
        self.id = kwargs.get('id', 1)
        self.name = kwargs.get('name', 'Test Artist')
        self.circus_education = kwargs.get('circus_education', False)
        self.stage_experience = kwargs.get('stage_experience', None)
        self.employment_type = kwargs.get('employment_type', None)
        self.awards_level = kwargs.get('awards_level', None)
        self.pepe_years = kwargs.get('pepe_years', 0)
        self.pepe_exclusivity = kwargs.get('pepe_exclusivity', False)
        self.admin_gage_override = kwargs.get('admin_gage_override', None)

def test_artist_scenario(name, **criteria):
    """Test a specific artist scenario."""
    print(f"\n{'='*60}")
    print(f"TEST: {name}")
    print(f"{'='*60}")

    artist = MockArtist(**criteria)

    print("KRITERIEN:")
    print(f"  Zirkusschule: {'Ja' if artist.circus_education else 'Nein'}")
    print(f"  Bühnenerfahrung: {artist.stage_experience or 'Nicht angegeben'}")
    print(f"  Beschäftigung: {artist.employment_type or 'Nicht angegeben'}")
    print(f"  Auszeichnungen: {artist.awards_level or 'Nicht angegeben'}")
    print(f"  Jahre bei Pepe: {artist.pepe_years}")
    print(f"  Pepe Exklusivität: {'Ja' if artist.pepe_exclusivity else 'Nein'}")

    # Calculate gage
    calculated_gage = GageCalculator.calculate_gage(artist)
    breakdown = GageCalculator.get_gage_breakdown(artist)

    print(f"\nBERECHNUNG:")
    print(f"  Berechnete Gage: {calculated_gage}€")

    # ±20% spread
    spread = int(calculated_gage * 0.2)
    price_min = calculated_gage - spread
    price_max = calculated_gage + spread
    print(f"  Preisspanne (±20%): {price_min}€ - {price_max}€")

    print(f"\nDETAILS:")
    for component, data in breakdown['components'].items():
        contribution_pct = data['contribution'] * 100
        print(f"  {component}: {data['value']} → {contribution_pct:.1f}% Beitrag")

    return calculated_gage, price_min, price_max

def main():
    print("GAGE CALCULATION TEST SCENARIOS")
    print("=" * 80)

    # Scenario 1: Maximum case (should be ~2500€)
    test_artist_scenario(
        "Top-Künstler (Ziel: ~2500€)",
        circus_education=True,
        stage_experience='10+',
        employment_type='vollzeit',
        awards_level='international',
        pepe_years=5,
        pepe_exclusivity=True
    )

    # Scenario 2: Minimum case (should be ~200€)
    test_artist_scenario(
        "Anfänger (Ziel: ~200€)",
        circus_education=False,
        stage_experience='0-2',
        employment_type='hobby',
        awards_level='keine',
        pepe_years=0,
        pepe_exclusivity=False
    )

    # Scenario 3: User's first example
    test_artist_scenario(
        "3 Jahre, Teilzeit, kein Zirkus, Pepe-Commitment, lokal",
        circus_education=False,
        stage_experience='3-5',
        employment_type='teilzeit',
        awards_level='lokal',
        pepe_years=2,
        pepe_exclusivity=True
    )

    # Scenario 4: User's second example
    test_artist_scenario(
        "International, 10+ Jahre, Zirkus, halbes Pepe-Commitment, Vollzeit",
        circus_education=True,
        stage_experience='10+',
        employment_type='vollzeit',
        awards_level='international',
        pepe_years=2,  # 2 Jahre = halbes Commitment
        pepe_exclusivity=False
    )

    # Scenario 5: User's third example
    test_artist_scenario(
        "5 Jahre, Teilzeit, kein Zirkus, keine Awards, Pepe-Commitment",
        circus_education=False,
        stage_experience='6-10',  # 5 Jahre = 6-10 Kategorie
        employment_type='teilzeit',
        awards_level='keine',
        pepe_years=3,
        pepe_exclusivity=True
    )

    # Additional middle scenarios
    test_artist_scenario(
        "Durchschnitts-Künstler (Mitte)",
        circus_education=True,
        stage_experience='3-5',
        employment_type='teilzeit',
        awards_level='regional',
        pepe_years=1,
        pepe_exclusivity=False
    )

    # ROBUSTNESS TESTS - Unknown Artists
    print(f"\n{'='*80}")
    print("ROBUSTNESS TESTS - Unbekannte/Neue Künstler")
    print(f"{'='*80}")

    test_artist_scenario(
        "Komplett unbekannter Künstler (alle None-Werte)",
        circus_education=False,
        stage_experience=None,
        employment_type=None,
        awards_level=None,
        pepe_years=0,
        pepe_exclusivity=False
    )

    test_artist_scenario(
        "Neuer Künstler - nur Grunddaten bekannt",
        circus_education=False,
        stage_experience='0-2',
        employment_type=None,
        awards_level=None,
        pepe_years=0,
        pepe_exclusivity=False
    )

    test_artist_scenario(
        "Teilweise bekannter Künstler",
        circus_education=True,
        stage_experience=None,
        employment_type='hobby',
        awards_level=None,
        pepe_years=0,
        pepe_exclusivity=False
    )

if __name__ == "__main__":
    main()