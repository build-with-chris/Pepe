from tests.conftest import bearer


def test_unapproved_artist_cannot_view_requests(client, artist_pending_row, clerk_token):
    """Ein gültiges Clerk-Token allein reicht nicht — der Artist muss freigegeben sein."""
    headers = bearer(clerk_token(artist_pending_row["uid"], email=artist_pending_row["email"]))

    resp = client.get("/api/requests/requests", headers=headers)
    assert resp.status_code == 403, resp.get_data(as_text=True)


def test_missing_token_is_unauthorized(client):
    resp = client.get("/api/requests/requests")
    assert resp.status_code == 401


def test_expired_token_is_rejected(client, artist_approved_row, clerk_token):
    headers = bearer(clerk_token(artist_approved_row["uid"],
                                 email=artist_approved_row["email"],
                                 expires_in=-60))
    resp = client.get("/api/requests/requests", headers=headers)
    assert resp.status_code == 401


def test_token_from_a_foreign_issuer_is_rejected(client, artist_approved_row, clerk_token):
    """Signatur allein reicht nicht, wenn CLERK_ISSUER gesetzt ist.

    Ohne diesen Check fällt beim Wechsel zwischen Clerk-Dev- und
    Production-Instanz eine vergessene JWKS-Umstellung nicht auf.
    """
    headers = bearer(clerk_token(artist_approved_row["uid"],
                                 email=artist_approved_row["email"],
                                 iss="https://irgendwo-anders.example"))

    resp = client.get("/api/requests/requests", headers=headers)
    assert resp.status_code == 401, resp.get_data(as_text=True)


def test_token_without_subject_is_rejected(client, clerk_token):
    """Ohne `sub` gibt es keine Identität, an der ein Artist hängen könnte."""
    headers = bearer(clerk_token(None))

    resp = client.get("/api/requests/requests", headers=headers)
    assert resp.status_code == 401, resp.get_data(as_text=True)


def test_non_admin_cannot_reach_admin_routes(client, user_headers):
    resp = client.get("/api/admin/artists?status=pending", headers=user_headers)
    assert resp.status_code == 403


def test_admin_can_reach_admin_routes(client, admin_headers):
    """AK 5 des End-to-End-Prüfschritts: 200 mit JSON-Array, nicht 422/403."""
    resp = client.get("/api/admin/artists?status=pending", headers=admin_headers)
    assert resp.status_code == 200, resp.get_data(as_text=True)
    assert isinstance(resp.get_json(), list)


def test_approve_stores_integer_admin_id(client, admin_headers, admin_artist,
                                          artist_pending, get_artist):
    """AK 2: `approved_by` ist die interne Artist-ID, kein Clerk-String."""
    resp = client.post(f"/api/admin/artists/{artist_pending}/approve", headers=admin_headers)
    assert resp.status_code == 200, resp.get_data(as_text=True)

    approved = get_artist(artist_pending)
    assert isinstance(approved.approved_by, int)
    assert approved.approved_by == admin_artist["id"]


def test_ensure_without_email_claim_creates_nothing(client, clerk_token):
    """Ohne `email` im Token wird kein Platzhalter-Artist angelegt."""
    from models import Artist, db

    headers = bearer(clerk_token("user_without_email_claim"))
    resp = client.post("/api/artists/me/ensure", headers=headers)

    assert resp.status_code == 400
    assert resp.get_json()["error"] == "invalid_token"
    assert db.session.query(Artist).count() == 0


def test_ensure_is_idempotent_for_same_user(client, clerk_token):
    """AK 6: Zweiter Login desselben Users erzeugt keinen zweiten Datensatz."""
    from models import Artist, db

    headers = bearer(clerk_token("user_new_signup", email="Neu@Example.com", name="Neu Nutzer"))

    first = client.post("/api/artists/me/ensure", headers=headers)
    assert first.status_code == 200, first.get_data(as_text=True)

    second = client.post("/api/artists/me/ensure", headers=headers)
    assert second.status_code == 200
    assert second.get_json()["id"] == first.get_json()["id"]

    rows = db.session.query(Artist).all()
    assert len(rows) == 1
    assert rows[0].email == "neu@example.com"
    assert rows[0].supabase_user_id == "user_new_signup"
    assert rows[0].approval_status == "unsubmitted"


def test_removed_debug_endpoints_are_gone(client):
    """AK 8: /__debug/db und /auth/debug-secret antworten mit 404."""
    assert client.get("/__debug/db").status_code == 404
    assert client.get("/auth/debug-secret").status_code == 404
    assert client.post("/auth/login", json={}).status_code == 404
