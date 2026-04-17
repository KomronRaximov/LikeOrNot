# LikeOrNot

Track the preferences of people you care about.

## Stack
- **Backend:** Django 4.2 + DRF + SQLite + JWT
- **Frontend:** React 18 + Vite + Tailwind CSS

## Quick Start

### 1. Setup env
```bash
cp .env.example .env
# Edit .env with your BOT_TOKEN etc.
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_categories
python manage.py createsuperuser   # optional
python manage.py runserver
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```


## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register/ | Register |
| POST | /api/auth/login/ | Login |
| GET | /api/auth/me/ | Current user |
| GET/POST | /api/profiles/ | Profiles |
| GET | /api/profiles/search/?username= | Search |
| POST | /api/profiles/create-from-username/ | Create/link profile |
| GET/POST | /api/preferences/ | Preferences |
| GET | /api/preferences/?profile=&sentiment= | Filter |
| GET/POST | /api/categories/ | Categories |
| GET | /api/stats/overview/ | Stats |
| GET | /api/stats/profile/<id>/ | Profile stats |

## Django Admin
Go to `http://localhost:8000/admin/`
