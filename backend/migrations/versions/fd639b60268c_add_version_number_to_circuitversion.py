"""Add version_number to CircuitVersion

Revision ID: fd639b60268c
Revises: cabfb0850448
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fd639b60268c'
down_revision = 'cabfb0850448'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add column as nullable first
    op.add_column('circuit_versions', sa.Column('version_number', sa.Integer(), nullable=True))
    
    # Update existing records with version numbers based on their order
    connection = op.get_bind()
    connection.execute(sa.text("""
        UPDATE circuit_versions 
        SET version_number = subquery.row_num 
        FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at) as row_num 
            FROM circuit_versions
        ) subquery 
        WHERE circuit_versions.id = subquery.id
    """))
    
    # Make the column not null
    op.alter_column('circuit_versions', 'version_number', nullable=False)


def downgrade() -> None:
    op.drop_column('circuit_versions', 'version_number')
