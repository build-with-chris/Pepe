"""
Gage Calculator Service

Berechnet die Künstler-Gage basierend auf verschiedenen Kriterien.
Maximum: 1.400€ bei voller Punktzahl.

Gewichtung:
- Bühnenerfahrung (30%)
- Beschäftigungsart / Vollzeit vs. Hobby (25%)
- Zirkusausbildung (15%)
- Auszeichnungen / internationale Gigs (15%)
- Jahre bei Pepe (10%)
- Exklusiv für Pepe (5%)

price_max = calculated_gage
price_min = calculated_gage * 0.80 (20% darunter)
"""

import logging

logger = logging.getLogger(__name__)


class GageCalculator:
    # Maximum gage when all criteria are at top level
    GAGE_MAX = 1400

    # --- Weight definitions (sum = 1.0) ---
    WEIGHTS = {
        'stage_experience': 0.30,
        'employment_type': 0.25,
        'circus_education': 0.15,
        'awards': 0.15,
        'pepe_years': 0.10,
        'pepe_exclusivity': 0.05,
    }

    # --- Scoring tables ---
    # Stage experience: years → contribution percentage of GAGE_MAX
    STAGE_EXPERIENCE_SCORES = {
        '10+': 1.0,       # 30% of 1400 = 420€
        '7-10': 0.667,    # 20% of 1400 = 280€
        '3-7': 0.333,     # 10% of 1400 = 140€
        '0-3': 0.167,     #  5% of 1400 =  70€
        # Legacy values (backwards compatibility)
        '6-10': 0.667,
        '3-5': 0.333,
        '0-2': 0.167,
        None: 0.0,
    }

    # Employment type
    EMPLOYMENT_TYPE_SCORES = {
        'vollzeit': 1.0,    # 25% of 1400 = 350€
        'teilzeit': 0.60,   # 15% of 1400 = 210€
        'hobby': 0.0,       #  0% of 1400 =   0€
        None: 0.0,
    }

    # Pepe years
    PEPE_YEARS_SCORES = {
        # 5+: 10%, 3-5: 7%, 1-3: 3%, <1: 0%
        5: 1.0,     # 10% of 1400 = 140€
        3: 0.70,    #  7% of 1400 =  98€
        1: 0.30,    #  3% of 1400 =  42€
        0: 0.0,     #  0%
    }

    @classmethod
    def _pepe_years_score(cls, years: int) -> float:
        """Map pepe_years integer to a score."""
        if years is None:
            return 0.0
        try:
            years = int(years)
        except (TypeError, ValueError):
            return 0.0
        if years >= 5:
            return 1.0
        elif years >= 3:
            return 0.70
        elif years >= 1:
            return 0.30
        return 0.0

    @classmethod
    def calculate_gage(cls, artist) -> int:
        """
        Berechnet die Gage eines Künstlers basierend auf seinen Kriterien.

        Returns:
            int: Berechnete Gage in EUR (max 1400)
        """
        # Check if admin override exists
        if getattr(artist, 'admin_gage_override', None):
            return artist.admin_gage_override

        total_score = 0.0

        # 1. Bühnenerfahrung (30%)
        exp_score = cls.STAGE_EXPERIENCE_SCORES.get(
            getattr(artist, 'stage_experience', None), 0.0
        )
        total_score += exp_score * cls.WEIGHTS['stage_experience']

        # 2. Beschäftigungsart (25%)
        emp_score = cls.EMPLOYMENT_TYPE_SCORES.get(
            getattr(artist, 'employment_type', None), 0.0
        )
        total_score += emp_score * cls.WEIGHTS['employment_type']

        # 3. Zirkusausbildung (15%)
        edu_score = 1.0 if getattr(artist, 'circus_education', False) else 0.0
        total_score += edu_score * cls.WEIGHTS['circus_education']

        # 4. Auszeichnungen / internationale Gigs (15%)
        # Simplified: boolean yes/no (has awards/international experience)
        awards = getattr(artist, 'awards_level', None)
        if awards and awards not in ('keine', 'none', None):
            award_score = 1.0   # 15% of 1400 = 210€
        else:
            award_score = 0.0
        total_score += award_score * cls.WEIGHTS['awards']

        # 5. Jahre bei Pepe (10%)
        pepe_years_score = cls._pepe_years_score(
            getattr(artist, 'pepe_years', 0)
        )
        total_score += pepe_years_score * cls.WEIGHTS['pepe_years']

        # 6. Exklusiv für Pepe (5%)
        excl_score = 1.0 if getattr(artist, 'pepe_exclusivity', False) else 0.0
        total_score += excl_score * cls.WEIGHTS['pepe_exclusivity']

        # Calculate final gage
        calculated_gage = cls.GAGE_MAX * total_score

        # Round to nearest 25€
        result = int(round(calculated_gage / 25) * 25)

        logger.debug(
            "GageCalculator: score=%.3f, gage=%d (exp=%.2f, emp=%.2f, edu=%.1f, awards=%.1f, years=%.2f, excl=%.1f)",
            total_score, result, exp_score, emp_score, edu_score, award_score, pepe_years_score, excl_score
        )

        return max(result, 0)

    @classmethod
    def get_price_range(cls, artist) -> tuple[int, int]:
        """
        Returns (price_min, price_max) based on calculated gage.
        price_max = calculated_gage
        price_min = calculated_gage * 0.80
        """
        gage = cls.calculate_gage(artist)
        price_max = gage
        price_min = int(gage * 0.80)
        return price_min, price_max

    @classmethod
    def get_gage_breakdown(cls, artist) -> dict:
        """
        Gibt eine detaillierte Aufschlüsselung der Gage-Berechnung zurück.
        """
        gage = cls.calculate_gage(artist)
        price_min, price_max = cls.get_price_range(artist)

        exp_score = cls.STAGE_EXPERIENCE_SCORES.get(
            getattr(artist, 'stage_experience', None), 0.0
        )
        emp_score = cls.EMPLOYMENT_TYPE_SCORES.get(
            getattr(artist, 'employment_type', None), 0.0
        )
        edu_score = 1.0 if getattr(artist, 'circus_education', False) else 0.0
        awards = getattr(artist, 'awards_level', None)
        award_score = 1.0 if (awards and awards not in ('keine', 'none', None)) else 0.0
        pepe_years_score = cls._pepe_years_score(getattr(artist, 'pepe_years', 0))
        excl_score = 1.0 if getattr(artist, 'pepe_exclusivity', False) else 0.0

        return {
            'total_gage': gage,
            'price_min': price_min,
            'price_max': price_max,
            'gage_max': cls.GAGE_MAX,
            'admin_override': getattr(artist, 'admin_gage_override', None),
            'components': {
                'stage_experience': {
                    'label': 'Bühnenerfahrung',
                    'value': getattr(artist, 'stage_experience', None) or 'Nicht angegeben',
                    'score': exp_score,
                    'weight': cls.WEIGHTS['stage_experience'],
                    'contribution_eur': int(exp_score * cls.WEIGHTS['stage_experience'] * cls.GAGE_MAX),
                },
                'employment_type': {
                    'label': 'Beschäftigungsart',
                    'value': getattr(artist, 'employment_type', None) or 'Nicht angegeben',
                    'score': emp_score,
                    'weight': cls.WEIGHTS['employment_type'],
                    'contribution_eur': int(emp_score * cls.WEIGHTS['employment_type'] * cls.GAGE_MAX),
                },
                'circus_education': {
                    'label': 'Zirkusausbildung',
                    'value': 'Ja' if getattr(artist, 'circus_education', False) else 'Nein',
                    'score': edu_score,
                    'weight': cls.WEIGHTS['circus_education'],
                    'contribution_eur': int(edu_score * cls.WEIGHTS['circus_education'] * cls.GAGE_MAX),
                },
                'awards': {
                    'label': 'Auszeichnungen / International',
                    'value': awards or 'Keine',
                    'score': award_score,
                    'weight': cls.WEIGHTS['awards'],
                    'contribution_eur': int(award_score * cls.WEIGHTS['awards'] * cls.GAGE_MAX),
                },
                'pepe_years': {
                    'label': 'Jahre bei Pepe',
                    'value': f"{getattr(artist, 'pepe_years', 0)} Jahre",
                    'score': pepe_years_score,
                    'weight': cls.WEIGHTS['pepe_years'],
                    'contribution_eur': int(pepe_years_score * cls.WEIGHTS['pepe_years'] * cls.GAGE_MAX),
                },
                'pepe_exclusivity': {
                    'label': 'Exklusiv für Pepe',
                    'value': 'Ja' if getattr(artist, 'pepe_exclusivity', False) else 'Nein',
                    'score': excl_score,
                    'weight': cls.WEIGHTS['pepe_exclusivity'],
                    'contribution_eur': int(excl_score * cls.WEIGHTS['pepe_exclusivity'] * cls.GAGE_MAX),
                },
            }
        }
