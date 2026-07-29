from models import Artist, db

def test_reject_artist_success(client, admin_headers, artist_pending, get_artist):
    artist_id = artist_pending
    resp = client.post(
        f"/api/admin/artists/{artist_id}/reject",
        headers=admin_headers,
        json={"reason": "Profil unvollständig"},
    )
    assert resp.status_code == 200, resp.get_data(as_text=True)
    data = resp.get_json()
    assert data["id"] == artist_id
    assert data["status"] == "rejected"
    assert data["rejection_reason"] == "Profil unvollständig"

    # DB-Check frisch laden
    updated = get_artist(artist_id)
    assert updated is not None
    assert updated.approval_status == "rejected"
    assert updated.rejection_reason == "Profil unvollständig"
    # Wenn approved_by/approved_at Felder existieren, sollten sie geleert sein
    if hasattr(updated, "approved_by"):
        assert updated.approved_by is None
    if hasattr(updated, "approved_at"):
        assert updated.approved_at is None


def test_reject_artist_forbidden_for_non_admin(client, user_headers, artist_pending):
    artist_id = artist_pending
    resp = client.post(
        f"/api/admin/artists/{artist_id}/reject",
        headers=user_headers,
        json={"reason": "nope"},
    )
    assert resp.status_code in (401, 403), resp.get_data(as_text=True)


def test_reject_artist_not_found(client, admin_headers):
    resp = client.post(
        "/api/admin/artists/999999/reject",
        headers=admin_headers,
        json={"reason": "not existing"},
    )
    assert resp.status_code == 404, resp.get_data(as_text=True)

def test_reject_sends_email_with_reason(client, admin_headers, artist_pending, get_artist, monkeypatch):
    """SPEC-2, Kriterium 3: Die Ablehnungsmail enthält den eingegebenen Grund."""
    import routes.admin_routes as admin_routes

    sent = []
    monkeypatch.setattr(admin_routes, 'send_email',
                        lambda to, subject, html: sent.append((to, subject, html)) or True)

    artist_email = get_artist(artist_pending).email
    resp = client.post(
        f"/api/admin/artists/{artist_pending}/reject",
        headers=admin_headers,
        json={"reason": "Bitte bessere Fotos"},
    )
    assert resp.status_code == 200, resp.get_data(as_text=True)
    assert resp.get_json()["email_sent"] is True

    assert len(sent) == 1
    to, _subject, html = sent[0]
    assert to == artist_email
    assert "Bitte bessere Fotos" in html
