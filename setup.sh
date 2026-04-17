#!/usr/bin/env bash
set -e

echo "=== LikeOrNot Setup ==="

# Copy env
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example — edit it with your settings."
fi

# Backend
echo ""
echo "--- Setting up backend ---"
cd backend
python -m venv venv
source venv/bin/activate || source venv/Scripts/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_categories
echo "Backend ready."
cd ..

# Frontend
echo ""
echo "--- Setting up frontend ---"
cd frontend
npm install
echo "Frontend ready."
cd ..

echo ""
echo "=== Setup complete! ==="
echo ""
echo "To run:"
echo "  Backend:  cd backend && python manage.py runserver"
echo "  Frontend: cd frontend && npm run dev"
echo "  Bot:      cd .. && pip install -r bot/requirements.txt && python -m bot.main"
