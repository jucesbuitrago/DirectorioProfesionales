# Compatibility entrypoint for uvicorn backend.main:app
# Works whether you run from the project root:
#   uvicorn backend.main:app --reload
# or inside the backend folder:
#   uvicorn main:app --reload

import os
import sys

# Ensure project root is on sys.path so 'backend' is importable whether launched
# from the project root or from the backend/ directory (including Uvicorn reloader).
_CURRENT_DIR = os.path.dirname(__file__)
_PROJECT_ROOT = os.path.abspath(os.path.join(_CURRENT_DIR, ".."))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

try:
    # Prefer absolute import when project root is on sys.path
    from backend.app.main import app as _app  # type: ignore
    app = _app  # noqa: F401
except ModuleNotFoundError:
    # Fallback to local package when running strictly inside backend/
    from app.main import app as _app  # type: ignore
    app = _app  # noqa: F401