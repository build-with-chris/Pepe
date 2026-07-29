# tests/integration/test_admin_approve.py
from models import Artist

def test_approve_artist_success(client, admin_headers, artist_pending, get_artist):
    # artist_pending ist jetzt eine ID
    artist_id = artist_pending

    resp = client.post(f"/api/admin/artists/{artist_id}/approve", headers=admin_headers)
    assert resp.status_code == 200, resp.get_data(as_text=True)

    data = resp.get_json()
    assert data["id"] == artist_id
    assert data["status"] == "approved"
    if data.get("approved_at"):
        assert isinstance(data["approved_at"], str)

    # DB-Check (frisch laden)
    updated = get_artist(artist_id)
    assert updated is not None
    assert updated.approval_status == "approved"


def test_approve_artist_forbidden_for_non_admin(client, user_headers, artist_pending):
    artist_id = artist_pending
    resp = client.post(f"/api/admin/artists/{artist_id}/approve", headers=user_headers)
    assert resp.status_code in (401, 403), resp.get_data(as_text=True)


def test_approve_artist_not_found(client, admin_headers):
    resp = client.post("/api/admin/artists/999999/approve", headers=admin_headers)
    assert resp.status_code == 404, resp.get_data(as_text=True)

def test_approve_sends_email_to_artist(client, admin_headers, artist_pending, get_artist, monkeypatch):
    """SPEC-2, Kriterium 3: Bei der Freigabe geht eine Mail an die Artist-Adresse."""
    import routes.admin_routes as admin_routes

    sent = []
    monkeypatch.setattr(admin_routes, 'send_email',
                        lambda to, subject, html: sent.append((to, subject, html)) or True)

    artist_email = get_artist(artist_pending).email
    resp = client.post(f"/api/admin/artists/{artist_pending}/approve", headers=admin_headers)
    assert resp.status_code == 200, resp.get_data(as_text=True)
    assert resp.get_json()["email_sent"] is True

    assert len(sent) == 1
    to, subject, html = sent[0]
    assert to == artist_email
    assert 'freigegeben' in subject.lower()


def test_approve_skips_placeholder_address(client, admin_headers, artist_pending, get_artist, monkeypatch):
    """Platzhalter-Adressen (@clerk.placeholder) werden nicht angemailt."""
    import routes.admin_routes as admin_routes
    from models import db

    sent = []
    monkeypatch.setattr(admin_routes, 'send_email',
                        lambda to, subject, html: sent.append(to) or True)

    artist = get_artist(artist_pending)
    artist.email = 'user_abc@clerk.placeholder'
    db.session.commit()

    resp = client.post(f"/api/admin/artists/{artist_pending}/approve", headers=admin_headers)
    assert resp.status_code == 200, resp.get_data(as_text=True)
    assert resp.get_json()["email_sent"] is False
    assert sent == []


def test_approve_survives_broken_smtp(client, admin_headers, artist_pending, get_artist, monkeypatch):
    """Ein SMTP-Fehler darf die Freigabe nicht zurückrollen."""
    import routes.admin_routes as admin_routes

    def boom(*args, **kwargs):
        raise RuntimeError("smtp down")

    monkeypatch.setattr(admin_routes, 'send_email', boom)

    resp = client.post(f"/api/admin/artists/{artist_pending}/approve", headers=admin_headers)
    assert resp.status_code == 200, resp.get_data(as_text=True)
    assert resp.get_json()["email_sent"] is False
    assert get_artist(artist_pending).approval_status == "approved"
