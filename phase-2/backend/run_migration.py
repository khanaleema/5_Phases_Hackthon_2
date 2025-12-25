"""
Quick script to run database migrations.
Run this: python run_migration.py
"""
import os
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not installed, using environment variables directly")

# Import alembic
try:
    from alembic import command
    from alembic.config import Config
except ImportError:
    print("Error: alembic not installed. Run: pip install alembic")
    sys.exit(1)

def run_migration():
    """Run alembic upgrade head"""
    alembic_cfg = Config(str(backend_dir / "alembic.ini"))
    alembic_cfg.set_main_option("script_location", str(backend_dir / "alembic"))
    
    # Override database URL from environment if set
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        alembic_cfg.set_main_option("sqlalchemy.url", db_url)
    
    print("=" * 60)
    print("Running database migration...")
    print("=" * 60)
    
    db_url_display = db_url or alembic_cfg.get_main_option("sqlalchemy.url")
    if db_url_display:
        # Hide password in display
        if "@" in db_url_display:
            parts = db_url_display.split("@")
            if ":" in parts[0]:
                user_pass = parts[0].split(":")[0] + ":***"
                db_url_display = user_pass + "@" + parts[1]
        print(f"Database: {db_url_display}")
    else:
        print("Database URL: NOT SET (check .env file)")
    
    print()
    
    try:
        command.upgrade(alembic_cfg, "head")
        print("\n✅ Migration completed successfully!")
        print("\nVerifying...")
        from alembic.script import ScriptDirectory
        script = ScriptDirectory.from_config(alembic_cfg)
        current = script.get_current_head()
        print(f"Current migration: {current}")
        print("\n✅ Tasks table should now exist!")
    except Exception as e:
        print(f"\n❌ Migration failed!")
        print(f"Error: {e}")
        print("\n" + "=" * 60)
        print("Troubleshooting:")
        print("=" * 60)
        print("1. Make sure PostgreSQL is running")
        print("   - Check if database server is accessible")
        print("   - Default: postgresql://postgres:postgres@localhost:5432/todo_db")
        print()
        print("2. Check DATABASE_URL in .env file")
        print("   - Create .env file if it doesn't exist")
        print("   - Add: DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todo_db")
        print()
        print("3. Verify database exists")
        print("   - Connect to PostgreSQL and create database if needed")
        print()
        print("4. Install dependencies:")
        print("   - pip install alembic sqlmodel psycopg2-binary python-dotenv")
        sys.exit(1)

if __name__ == "__main__":
    run_migration()
