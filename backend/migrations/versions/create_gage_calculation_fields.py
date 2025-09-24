"""add gage calculation fields to artist

Revision ID: gage_calc_001
Revises: f1fcce6d44f0
Create Date: 2024-09-24 09:50:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'gage_calc_001'
down_revision = 'f1fcce6d44f0'
branch_labels = None
depends_on = None

def upgrade():
    # Add new gage calculation fields to artists table
    op.add_column('artists', sa.Column('calculated_gage', sa.Integer(), nullable=True))
    op.add_column('artists', sa.Column('admin_gage_override', sa.Integer(), nullable=True))
    op.add_column('artists', sa.Column('circus_education', sa.Boolean(), nullable=True, default=False))
    op.add_column('artists', sa.Column('stage_experience', sa.String(length=10), nullable=True))
    op.add_column('artists', sa.Column('employment_type', sa.String(length=20), nullable=True))
    op.add_column('artists', sa.Column('awards_level', sa.String(length=20), nullable=True))
    op.add_column('artists', sa.Column('pepe_years', sa.Integer(), nullable=True, default=0))
    op.add_column('artists', sa.Column('pepe_exclusivity', sa.Boolean(), nullable=True, default=False))

def downgrade():
    # Remove gage calculation fields
    op.drop_column('artists', 'pepe_exclusivity')
    op.drop_column('artists', 'pepe_years')
    op.drop_column('artists', 'awards_level')
    op.drop_column('artists', 'employment_type')
    op.drop_column('artists', 'stage_experience')
    op.drop_column('artists', 'circus_education')
    op.drop_column('artists', 'admin_gage_override')
    op.drop_column('artists', 'calculated_gage')