"""add geo_precision to artists

Haelt fest, auf welcher Stufe die Adresse eines Artists aufloesbar war:
'exact', 'street', 'postal' oder 'city'. NULL heisst, dass keine Stufe
gegriffen hat. Ein Tippfehler im Strassennamen landet auf 'postal' — die
Anfahrt stimmt dann bis auf den Ortsmittelpunkt, statt komplett auszufallen.

Revision ID: d5f2b8c14a37
Revises: c4e1a7b93f20
Create Date: 2026-08-03 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd5f2b8c14a37'
down_revision = 'c4e1a7b93f20'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('artists', sa.Column('geo_precision', sa.String(length=10), nullable=True))
    # Bestehende Artists mit Koordinaten wurden ohne Stufenlogik aufgeloest,
    # also als exakter Treffer. Wer keine Koordinaten hat, bleibt NULL.
    op.execute("UPDATE artists SET geo_precision = 'exact' WHERE lat IS NOT NULL AND lon IS NOT NULL")


def downgrade():
    op.drop_column('artists', 'geo_precision')
