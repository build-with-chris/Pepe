"""add client contact and planning fields to booking_requests

Der Booking-Assistent fragt Telefonnummer (Pflichtfeld), Unternehmen,
Budgetrahmen, Planungsstand und zusaetzliche Ortsangaben ab. Bisher gab es
keine Spalten dafuer, die Angaben wurden nach dem Absenden verworfen.
Dazu die beiden Technikfelder, die die Zusammenfassung schon anzeigte.

Revision ID: c4e1a7b93f20
Revises: 8f4c2b9e1a0d
Create Date: 2026-08-03 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c4e1a7b93f20'
down_revision = '8f4c2b9e1a0d'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('booking_requests', sa.Column('client_phone', sa.String(length=40), nullable=True))
    op.add_column('booking_requests', sa.Column('client_company', sa.String(length=120), nullable=True))
    op.add_column('booking_requests', sa.Column('budget_range', sa.String(length=30), nullable=True))
    op.add_column('booking_requests', sa.Column('planning_status', sa.String(length=30), nullable=True))
    op.add_column('booking_requests', sa.Column('location_details', sa.Text(), nullable=True))
    op.add_column('booking_requests', sa.Column('needs_stage_floor', sa.Boolean(), nullable=True,
                                                server_default=sa.false()))
    op.add_column('booking_requests', sa.Column('needs_rigging', sa.Boolean(), nullable=True,
                                                server_default=sa.false()))


def downgrade():
    op.drop_column('booking_requests', 'needs_rigging')
    op.drop_column('booking_requests', 'needs_stage_floor')
    op.drop_column('booking_requests', 'location_details')
    op.drop_column('booking_requests', 'planning_status')
    op.drop_column('booking_requests', 'budget_range')
    op.drop_column('booking_requests', 'client_company')
    op.drop_column('booking_requests', 'client_phone')
