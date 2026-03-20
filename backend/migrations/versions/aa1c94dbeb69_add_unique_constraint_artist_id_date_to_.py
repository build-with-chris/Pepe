"""Add unique constraint artist_id+date to availability

Revision ID: aa1c94dbeb69
Revises: 5318f0092b8e
Create Date: 2025-08-01 10:04:22.403723
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = 'aa1c94dbeb69'
down_revision = '5318f0092b8e'
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = inspect(bind)

    # Unique constraint auf (artist_id, date) nur hinzufügen, wenn sie noch nicht existiert
    existing = [c['name'] for c in inspector.get_unique_constraints('availabilities')]
    if 'uq_artist_date' not in existing:
        with op.batch_alter_table('availabilities', schema=None) as batch_op:
            batch_op.create_unique_constraint('uq_artist_date', ['artist_id', 'date'])


def downgrade():
    bind = op.get_bind()
    inspector = inspect(bind)

    # Unique constraint nur entfernen, wenn sie existiert
    existing = [c['name'] for c in inspector.get_unique_constraints('availabilities')]
    if 'uq_artist_date' in existing:
        with op.batch_alter_table('availabilities', schema=None) as batch_op:
            batch_op.drop_constraint('uq_artist_date', type_='unique')