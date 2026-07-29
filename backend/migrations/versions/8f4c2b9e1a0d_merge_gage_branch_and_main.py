"""Merge gage_calc_001 branch with main line (7759e31194a7).

Zuvor gab es zwei Heads; ``flask db upgrade`` (singular ``head``) schlug fehl.
Nach diesem Merge gibt es wieder genau einen Head.

Revision ID: 8f4c2b9e1a0d
Revises: 7759e31194a7, gage_calc_001
Create Date: 2026-03-20

"""
from alembic import op
import sqlalchemy as sa

revision = '8f4c2b9e1a0d'
down_revision = ('7759e31194a7', 'gage_calc_001')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
