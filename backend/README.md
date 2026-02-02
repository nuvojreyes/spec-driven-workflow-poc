# Backend (Django)

Minimal Django backend scaffold.

Setup (macOS / Linux):

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The Django project is in the `project` package. URLs: `http://127.0.0.1:8000/` (simple API view at `/api/`).
