"""
Gage Calculator Service

Berechnet die Künstler-Gage basierend auf verschiedenen Kriterien:
- Bühnenerfahrung (40%)
- Zirkusausbildung (25%)
- Beschäftigungsart (20%)
- Auszeichnungen (10%)
- Pepe-Commitment (5%)
"""

class GageCalculator:
    # Base gage range - updated for realistic pricing
    BASE_MIN = 200
    BASE_MAX = 2500

    # Gewichtung der Kriterien
    WEIGHTS = {
        'stage_experience': 0.40,
        'circus_education': 0.25,
        'employment_type': 0.20,
        'awards_level': 0.10,
        'pepe_commitment': 0.05
    }

    # Scoring tables - adjusted for robustness with unknown artists
    STAGE_EXPERIENCE_SCORES = {
        '0-2': 0.1,      # Reduziert für echte Anfänger
        '3-5': 0.4,
        '6-10': 0.7,
        '10+': 1.0,
        None: 0.0        # Unbekannte Künstler = Minimum
    }

    EMPLOYMENT_TYPE_SCORES = {
        'vollzeit': 1.0,
        'teilzeit': 0.5,  # Reduziert
        'hobby': 0.2,     # Reduziert
        None: 0.0         # Unbekannt = Minimum
    }

    AWARDS_SCORES = {
        'international': 1.0,
        'national': 0.8,
        'regional': 0.4,   # Reduziert
        'lokal': 0.2,      # Reduziert
        'keine': 0.05,     # Stark reduziert
        None: 0.0          # Unbekannt = Minimum
    }

    @classmethod
    def calculate_gage(cls, artist) -> int:
        """
        Berechnet die Gage eines Künstlers basierend auf seinen Kriterien.

        Args:
            artist: Artist model instance

        Returns:
            int: Berechnete Gage in Cent
        """
        # Check if admin override exists
        if artist.admin_gage_override:
            return artist.admin_gage_override

        total_score = 0.0

        # 1. Bühnenerfahrung (40%)
        exp_score = cls.STAGE_EXPERIENCE_SCORES.get(artist.stage_experience, 0.0)
        total_score += exp_score * cls.WEIGHTS['stage_experience']

        # 2. Zirkusausbildung (25%)
        edu_score = 1.0 if artist.circus_education else 0.1  # Reduziert für Robustheit
        total_score += edu_score * cls.WEIGHTS['circus_education']

        # 3. Beschäftigungsart (20%)
        emp_score = cls.EMPLOYMENT_TYPE_SCORES.get(artist.employment_type, 0.0)
        total_score += emp_score * cls.WEIGHTS['employment_type']

        # 4. Auszeichnungen (10%)
        award_score = cls.AWARDS_SCORES.get(artist.awards_level, 0.0)
        total_score += award_score * cls.WEIGHTS['awards_level']

        # 5. Pepe-Commitment (5%)
        commitment_score = cls._calculate_pepe_commitment(artist)
        total_score += commitment_score * cls.WEIGHTS['pepe_commitment']

        # Calculate final gage
        gage_range = cls.BASE_MAX - cls.BASE_MIN
        calculated_gage = cls.BASE_MIN + (gage_range * total_score)

        # Round to nearest 25€
        return int(round(calculated_gage / 25) * 25)

    @classmethod
    def _calculate_pepe_commitment(cls, artist) -> float:
        """Berechnet Pepe-Commitment Score (0.0 - 1.0)"""
        score = 0.0

        # Jahre bei Pepe (max 0.6)
        years_score = min(artist.pepe_years * 0.15, 0.6)
        score += years_score

        # Exklusivität (0.4)
        if artist.pepe_exclusivity:
            score += 0.4

        return min(score, 1.0)

    @classmethod
    def get_gage_breakdown(cls, artist) -> dict:
        """
        Gibt eine detaillierte Aufschlüsselung der Gage-Berechnung zurück.

        Returns:
            dict: Breakdown der einzelnen Komponenten
        """
        breakdown = {
            'total_gage': cls.calculate_gage(artist),
            'base_range': f"{cls.BASE_MIN}€ - {cls.BASE_MAX}€",
            'components': {}
        }

        # Bühnenerfahrung
        exp_score = cls.STAGE_EXPERIENCE_SCORES.get(artist.stage_experience, 0.0)
        breakdown['components']['stage_experience'] = {
            'value': artist.stage_experience or 'Nicht angegeben',
            'score': exp_score,
            'weight': cls.WEIGHTS['stage_experience'],
            'contribution': exp_score * cls.WEIGHTS['stage_experience']
        }

        # Zirkusausbildung
        edu_score = 1.0 if artist.circus_education else 0.1
        breakdown['components']['circus_education'] = {
            'value': 'Ja' if artist.circus_education else 'Nein',
            'score': edu_score,
            'weight': cls.WEIGHTS['circus_education'],
            'contribution': edu_score * cls.WEIGHTS['circus_education']
        }

        # Beschäftigungsart
        emp_score = cls.EMPLOYMENT_TYPE_SCORES.get(artist.employment_type, 0.0)
        breakdown['components']['employment_type'] = {
            'value': artist.employment_type or 'Nicht angegeben',
            'score': emp_score,
            'weight': cls.WEIGHTS['employment_type'],
            'contribution': emp_score * cls.WEIGHTS['employment_type']
        }

        # Auszeichnungen
        award_score = cls.AWARDS_SCORES.get(artist.awards_level, 0.0)
        breakdown['components']['awards_level'] = {
            'value': artist.awards_level or 'Nicht angegeben',
            'score': award_score,
            'weight': cls.WEIGHTS['awards_level'],
            'contribution': award_score * cls.WEIGHTS['awards_level']
        }

        # Pepe-Commitment
        commitment_score = cls._calculate_pepe_commitment(artist)
        breakdown['components']['pepe_commitment'] = {
            'value': f"{artist.pepe_years} Jahre, Exklusiv: {'Ja' if artist.pepe_exclusivity else 'Nein'}",
            'score': commitment_score,
            'weight': cls.WEIGHTS['pepe_commitment'],
            'contribution': commitment_score * cls.WEIGHTS['pepe_commitment']
        }

        return breakdown