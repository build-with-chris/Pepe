"""GET /api/artists/email/<email>.

Die Route rief `artist.serialize()` auf — eine Methode, die es am Modell nicht
gibt. Sie hat also zuverlässig 500 geantwortet. Und sie stand jedem
eingeloggten Nutzer offen: wäre `serialize()` vorhanden gewesen, hätte man mit
einer geratenen Adresse fremde Profildaten abgreifen können.
"""

from tests.conftest import bearer


def test_own_profile_is_returned(client, artist_approved_row, clerk_token):
    headers = bearer(clerk_token(artist_approved_row["uid"],
                                 email=artist_approved_row["email"]))

    resp = client.get(f"/api/artists/email/{artist_approved_row['email']}",
                      headers=headers)

    assert resp.status_code == 200, resp.get_data(as_text=True)
    assert resp.get_json()["id"] == artist_approved_row["id"]


def test_foreign_profile_is_forbidden(client, artist_approved_row,
                                      artist_pending_row, clerk_token):
    headers = bearer(clerk_token(artist_approved_row["uid"],
                                 email=artist_approved_row["email"]))

    resp = client.get(f"/api/artists/email/{artist_pending_row['email']}",
                      headers=headers)

    assert resp.status_code == 403, resp.get_data(as_text=True)


def test_admin_may_look_up_anyone(client, admin_headers, artist_pending_row):
    resp = client.get(f"/api/artists/email/{artist_pending_row['email']}",
                      headers=admin_headers)

    assert resp.status_code == 200, resp.get_data(as_text=True)
    assert resp.get_json()["id"] == artist_pending_row["id"]


def test_unknown_address_is_a_404(client, admin_headers):
    resp = client.get("/api/artists/email/gibtsnicht@example.com",
                      headers=admin_headers)

    assert resp.status_code == 404


def test_lookup_requires_a_token(client, artist_approved_row):
    resp = client.get(f"/api/artists/email/{artist_approved_row['email']}")

    assert resp.status_code == 401
