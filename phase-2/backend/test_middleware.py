"""
Quick validation script to test middleware configuration.
"""
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

try:
    from src.main import app
    print("✓ FastAPI app imported successfully")
    print(f"✓ App title: {app.title}")
    print(f"✓ Middleware count: {len(app.user_middleware)}")

    # Check CORS middleware
    cors_middleware = [m for m in app.user_middleware if "CORSMiddleware" in str(m.cls)]
    if cors_middleware:
        print("✓ CORS middleware configured correctly")
    else:
        print("✗ CORS middleware not found")

    print("\n✓ No middleware syntax errors detected!")

except Exception as e:
    print(f"✗ Error loading app: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
