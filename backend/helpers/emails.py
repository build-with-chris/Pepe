"""E-Mail-Versand und HTML-Builder.

Zog aus `routes/request_routes.py` hierher, damit auch `admin_routes.py`
(Freigabe/Ablehnung) versenden kann, ohne einen Blueprint zu importieren.
Die Builder bleiben bewusst je eine eigenständige f-String-Funktion — kein
Template-System, siehe SPEC-2.
"""

from datetime import date, datetime
from email.message import EmailMessage
import smtplib
import ssl

from flask import current_app


def format_event_date(value) -> str:
    """Formatiert ein Event-Datum als TT.MM.JJJJ.

    `BookingRequest.event_date` ist eine `db.Date`, also ein `date` und *kein*
    `datetime`. Eine reine `isinstance(value, datetime)`-Prüfung war deshalb nie
    wahr und jede Mail zeigte das ISO-Datum. `date` zuerst prüfen geht nicht —
    `datetime` ist eine Unterklasse von `date`, die Reihenfolge hier stimmt.
    """
    if isinstance(value, (datetime, date)):
        return value.strftime('%d.%m.%Y')
    if isinstance(value, str):
        try:
            return date.fromisoformat(value[:10]).strftime('%d.%m.%Y')
        except ValueError:
            return value
    return str(value) if value is not None else '—'


def format_disciplines(value) -> str:
    """Gibt Disziplinen als lesbare Liste zurück.

    In der DB steht ein komma-separierter String (`show_discipline` ist Text).
    Ein `', '.join(...)` darüber hätte den String zeichenweise zerlegt.
    """
    if not value:
        return '—'
    if isinstance(value, (list, tuple, set)):
        parts = [str(v).strip() for v in value if str(v).strip()]
    else:
        parts = [p.strip() for p in str(value).split(',') if p.strip()]
    return ', '.join(parts) if parts else '—'


# Endet eine Adresse auf das Land, ist das letzte Glied nicht die Stadt.
_COUNTRY_SUFFIXES = {
    'deutschland', 'germany', 'de',
    'österreich', 'oesterreich', 'austria', 'at',
    'schweiz', 'switzerland', 'ch',
}


def event_city(address) -> str:
    """Ortsangabe für Betreff und Mailkopf.

    Grobe Heuristik über die Adressglieder: das letzte Glied nehmen, ein
    angehängtes Land überspringen und eine führende PLZ abschneiden. Aus
    "Reeperbahn 1, 20359 Hamburg, Deutschland" wird so "Hamburg" statt
    "Deutschland".
    """
    if not address:
        return ''
    parts = [p.strip() for p in str(address).split(',') if p.strip()]
    while parts and parts[-1].lower() in _COUNTRY_SUFFIXES:
        parts.pop()
    if not parts:
        return ''
    tokens = parts[-1].split()
    # Führende Postleitzahl entfernen ("20359 Hamburg" -> "Hamburg")
    if len(tokens) > 1 and tokens[0].isdigit():
        tokens = tokens[1:]
    return ' '.join(tokens)


def send_email(to_email: str, subject: str, html: str) -> bool:
    """Send an HTML email using SMTP settings from Flask config.

    Required config keys:
      - SMTP_HOST
      - SMTP_PORT (default 587)
      - SMTP_USER
      - SMTP_PASSWORD
      - SMTP_FROM (defaults to SMTP_USER)
    """
    host = current_app.config.get('SMTP_HOST')
    port = int(current_app.config.get('SMTP_PORT', 587))
    user = current_app.config.get('SMTP_USER')
    password = current_app.config.get('SMTP_PASSWORD')
    from_addr = current_app.config.get('SMTP_FROM', user)

    if not (host and user and password and to_email):
        current_app.logger.warning("Email not sent — missing SMTP config or recipient")
        return False

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = from_addr
    msg['To'] = to_email
    msg.set_content("Neue Anfrage. Bitte im Browser öffnen.")
    msg.add_alternative(html, subtype='html')

    try:
        with smtplib.SMTP(host, port) as server:
            server.starttls(context=ssl.create_default_context())
            server.login(user, password)
            server.send_message(msg)
        current_app.logger.info(f"Email sent to {to_email} (subject: {subject})")
        return True
    except Exception as e:
        current_app.logger.exception(f"Failed to send email to {to_email}: {e}")
        return False


def is_deliverable_address(email: str | None) -> bool:
    """Filter Platzhalter-Adressen (z. B. `…@clerk.placeholder`) heraus.

    Ohne diesen Filter laufen Freigabe-Mails gegen Adressen, die es nie gab —
    genau der Grund, warum bisher nie auffiel, ob der Versand überhaupt geht.
    """
    if not email or not isinstance(email, str):
        return False
    addr = email.strip().lower()
    if '@' not in addr:
        return False
    domain = addr.rsplit('@', 1)[-1]
    return not (domain.endswith('.placeholder') or domain.endswith('.invalid'))


def build_artist_new_request_email(artist, req):
    """Build a beautifully styled HTML email for a new booking request."""
    app_url = current_app.config.get('APP_URL', 'https://app.example.com')
    date_str = format_event_date(getattr(req, 'event_date', None))
    city = event_city(getattr(req, 'event_address', None))

    # Show artist's recommended gage instead of customer price
    artist_gage_range = None
    try:
        # Use artist's calculated gage range (price_min/max are the artist's gage ±20%)
        if hasattr(artist, 'price_min') and hasattr(artist, 'price_max') and artist.price_min and artist.price_max:
            artist_gage_range = f"{int(artist.price_min)}–{int(artist.price_max)} €"
        elif hasattr(artist, 'calculated_gage') and artist.calculated_gage:
            artist_gage_range = f"{int(artist.calculated_gage)} €"
    except Exception:
        artist_gage_range = None

    disciplines_str = format_disciplines(getattr(req, 'show_discipline', None))

    artist_name = getattr(artist, 'name', 'Künstler:in')

    # Map event types to icons
    event_icons = {
        'hochzeit': '💒',
        'geburtstag': '🎂',
        'firmenfeier': '🏢',
        'festival': '🎪',
        'theater': '🎭',
        'gala': '✨',
        'private feier': '🎉',
        'corporate event': '🏢'
    }
    event_icon = event_icons.get((req.event_type or '').lower(), '🎪')

    return f"""
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">
              🎭 Neue Anfrage für dich!
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
              Hallo {artist_name} 👋
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px 20px;">

            <!-- Event Info Card -->
            <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #667eea;">
              <h3 style="margin: 0 0 15px 0; color: #334155; font-size: 18px; display: flex; align-items: center;">
                {event_icon} Event-Details
              </h3>
              <div style="display: grid; gap: 8px;">
                <div style="display: flex; align-items: center;">
                  <span style="display: inline-block; width: 20px; text-align: center; margin-right: 8px;">📅</span>
                  <strong style="color: #475569; min-width: 80px; margin-right: 8px;">Datum:</strong>
                  <span style="color: #334155;">{date_str}</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="display: inline-block; width: 20px; text-align: center; margin-right: 8px;">📍</span>
                  <strong style="color: #475569; min-width: 80px; margin-right: 8px;">Ort:</strong>
                  <span style="color: #334155;">{city or '—'}</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="display: inline-block; width: 20px; text-align: center; margin-right: 8px;">{event_icon}</span>
                  <strong style="color: #475569; min-width: 80px; margin-right: 8px;">Event:</strong>
                  <span style="color: #334155;">{req.event_type or '—'}</span>
                </div>
              </div>
            </div>

            <!-- Performance Details Card -->
            <div style="background: #fef7cd; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
              <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 18px; display: flex; align-items: center;">
                🎪 Performance-Details
              </h3>
              <div style="display: grid; gap: 8px;">
                <div style="display: flex; align-items: center;">
                  <span style="display: inline-block; width: 20px; text-align: center; margin-right: 8px;">🎨</span>
                  <strong style="color: #92400e; min-width: 100px; margin-right: 8px;">Disziplin:</strong>
                  <span style="color: #451a03; background: white; padding: 2px 8px; border-radius: 4px; font-weight: 500;">{disciplines_str}</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="display: inline-block; width: 20px; text-align: center; margin-right: 8px;">👥</span>
                  <strong style="color: #92400e; min-width: 100px; margin-right: 8px;">Team:</strong>
                  <span style="color: #451a03;">{req.team_size or '—'} {'Person' if str(req.team_size) == '1' else 'Personen'}</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="display: inline-block; width: 20px; text-align: center; margin-right: 8px;">⏱️</span>
                  <strong style="color: #92400e; min-width: 100px; margin-right: 8px;">Dauer:</strong>
                  <span style="color: #451a03;">{req.duration_minutes or '—'} Minuten</span>
                </div>
              </div>
            </div>

            <!-- Artist Gage Card -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
              <h3 style="margin: 0 0 10px 0; color: white; font-size: 16px;">💰 Deine empfohlene Gage</h3>
              <div style="color: white; font-size: 24px; font-weight: 700;">
                {artist_gage_range or 'noch nicht berechnet'}
              </div>
              {f'<p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Basierend auf deinen Kriterien</p>' if artist_gage_range else ''}
            </div>

            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="{app_url}/meine-anfragen"
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px;
                        font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                        transition: transform 0.2s;">
                🚀 Anfrage ansehen & antworten
              </a>
            </div>

          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">
              Diese E-Mail wurde automatisch gesendet. Bitte nicht direkt antworten.
            </p>
          </div>

        </div>
      </body>
    </html>
    """


def build_admin_new_request_email(req):
    """Build a minimal HTML email for admin notification of new booking request.

    Die Felder heißen am Modell `client_name`/`client_email` — die frühere
    Fassung las `customer_*` und `message`, die es nie gab. Jeder Aufruf endete
    deshalb in einem AttributeError, den der Aufrufer nur geloggt hat: Der Admin
    wurde über *keine* einzige Anfrage benachrichtigt.
    """
    app_url = current_app.config.get('APP_URL', 'https://app.example.com')
    date_str = format_event_date(getattr(req, 'event_date', None))
    city = event_city(getattr(req, 'event_address', None))
    disciplines_str = format_disciplines(getattr(req, 'show_discipline', None))
    price_range = None
    try:
        if req.price_min is not None and req.price_max is not None:
            price_range = f"{int(req.price_min)}–{int(req.price_max)} €"
    except (TypeError, ValueError):
        price_range = None

    special_requests = (getattr(req, 'special_requests', None) or '').strip()
    special_block = (
        f'<p><strong>Nachricht:</strong><br/>{special_requests}</p>'
        if special_requests else ''
    )

    return f"""
    <html>
      <body style="font-family: Arial, Helvetica, sans-serif; line-height:1.5;">
        <h2>🎭 Neue Buchungsanfrage eingegangen</h2>
        <p>
          <strong>Anfrage ID:</strong> #{req.id}<br/>
          <strong>Datum:</strong> {date_str}<br/>
          <strong>Ort:</strong> {city or '—'}<br/>
          <strong>Event:</strong> {req.event_type or '—'}<br/>
          <strong>Disziplin(en):</strong> {disciplines_str}<br/>
          <strong>Teamgröße:</strong> {req.team_size or '—'}<br/>
          <strong>Dauer:</strong> {req.duration_minutes or '—'} Minuten<br/>
          <strong>Gäste:</strong> {req.number_of_guests or '—'}<br/>
          <strong>Preisrahmen:</strong> {price_range or 'wird noch abgestimmt'}
        </p>
        <p>
          <strong>Kundendaten:</strong><br/>
          <strong>Name:</strong> {getattr(req, 'client_name', None) or '—'}<br/>
          <strong>E-Mail:</strong> {getattr(req, 'client_email', None) or '—'}
        </p>
        {special_block}
        <p>
          <a href="{app_url}/admin/requests/{req.id}" style="background:#111;color:#fff;padding:10px 16px;text-decoration:none;border-radius:6px;">Anfrage verwalten</a>
        </p>
        <hr style="border:none;border-top:1px solid #e5e5e5;"/>
        <small>Diese E-Mail wurde automatisch gesendet.</small>
      </body>
    </html>
    """


def build_artist_approved_email(artist):
    """HTML-Mail an einen Artist, dessen Profil freigegeben wurde."""
    app_url = current_app.config.get('APP_URL', 'https://app.example.com')
    artist_name = getattr(artist, 'name', None) or 'Künstler:in'

    return f"""
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">

          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">
              ✅ Dein Profil ist freigegeben!
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
              Hallo {artist_name} 👋
            </p>
          </div>

          <div style="padding: 30px 20px;">
            <p style="color: #334155; font-size: 16px; margin-top: 0;">
              wir haben dein Profil geprüft und freigegeben. Ab sofort wirst du bei passenden
              Anfragen berücksichtigt und bekommst neue Buchungsanfragen per E-Mail.
            </p>

            <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="margin: 0 0 10px 0; color: #334155; font-size: 16px;">Was du jetzt tun kannst</h3>
              <ul style="margin: 0; padding-left: 20px; color: #475569;">
                <li>Deine Verfügbarkeiten aktuell halten</li>
                <li>Profilbilder und Bio ergänzen</li>
                <li>Auf eingehende Anfragen mit deiner Gage antworten</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="{app_url}/meine-anfragen"
                 style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px;
                        font-weight: 600; font-size: 16px;">
                🚀 Zu meinen Anfragen
              </a>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">
              Diese E-Mail wurde automatisch gesendet. Bitte nicht direkt antworten.
            </p>
          </div>

        </div>
      </body>
    </html>
    """


def build_artist_rejected_email(artist, reason: str | None = None):
    """HTML-Mail an einen Artist, dessen Profil abgelehnt wurde (inkl. Grund)."""
    app_url = current_app.config.get('APP_URL', 'https://app.example.com')
    artist_name = getattr(artist, 'name', None) or 'Künstler:in'
    reason_text = (reason or '').strip()

    reason_block = f"""
            <div style="background: #fef2f2; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <h3 style="margin: 0 0 10px 0; color: #991b1b; font-size: 16px;">Begründung</h3>
              <p style="margin: 0; color: #7f1d1d; white-space: pre-line;">{reason_text}</p>
            </div>
    """ if reason_text else ''

    return f"""
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">

          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 600;">
              📝 Dein Profil braucht noch etwas
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
              Hallo {artist_name} 👋
            </p>
          </div>

          <div style="padding: 30px 20px;">
            <p style="color: #334155; font-size: 16px; margin-top: 0;">
              wir haben dein Profil geprüft und können es so noch nicht freigeben.
            </p>
            {reason_block}
            <p style="color: #334155; font-size: 16px;">
              Passe die genannten Punkte in deinem Profil an und reiche es einfach erneut zur
              Prüfung ein — wir schauen es uns dann direkt wieder an.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="{app_url}/profile"
                 style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                        color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px;
                        font-weight: 600; font-size: 16px;">
                ✏️ Profil bearbeiten
              </a>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">
              Diese E-Mail wurde automatisch gesendet. Bitte nicht direkt antworten.
            </p>
          </div>

        </div>
      </body>
    </html>
    """


__all__ = [
    "send_email",
    "is_deliverable_address",
    "format_event_date",
    "format_disciplines",
    "event_city",
    "build_artist_new_request_email",
    "build_admin_new_request_email",
    "build_artist_approved_email",
    "build_artist_rejected_email",
]
