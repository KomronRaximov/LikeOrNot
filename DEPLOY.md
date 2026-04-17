# Deploy Guide

This project is easiest to deploy on one domain with:

- `Nginx` serving the built frontend
- `Gunicorn` running Django
- `systemd` keeping Gunicorn alive

Example domain used below:

- frontend: `https://likeornot.example.com`
- backend API on same domain via `/api/`

## 1. Install packages

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip nginx nodejs npm
```

## 2. Clone project

```bash
cd /var/www
sudo git clone <YOUR_GITHUB_REPO> likeornot
sudo chown -R $USER:$USER /var/www/likeornot
cd /var/www/likeornot
```

## 3. Backend setup

```bash
cp .env.example .env
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_categories
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

Update the root `.env` file for production:

```env
SECRET_KEY=replace-with-a-long-random-secret
DEBUG=False
ALLOWED_HOSTS=likeornot.example.com,www.likeornot.example.com
CORS_ALLOWED_ORIGINS=https://likeornot.example.com,https://www.likeornot.example.com
CSRF_TRUSTED_ORIGINS=https://likeornot.example.com,https://www.likeornot.example.com
```

## 4. Frontend build

```bash
cd /var/www/likeornot/frontend
npm install
npm run build
```

## 5. Gunicorn service

Create `/etc/systemd/system/likeornot.service`:

```ini
[Unit]
Description=LikeOrNot Django Gunicorn
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/var/www/likeornot/backend
EnvironmentFile=/var/www/likeornot/.env
ExecStart=/var/www/likeornot/backend/.venv/bin/gunicorn config.wsgi:application --bind 127.0.0.1:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Replace `User=ubuntu` with your actual server username.

Then run:

```bash
sudo systemctl daemon-reload
sudo systemctl enable likeornot
sudo systemctl start likeornot
sudo systemctl status likeornot
```

## 6. Nginx config

Create `/etc/nginx/sites-available/likeornot`:

```nginx
server {
    listen 80;
    server_name likeornot.example.com www.likeornot.example.com;

    root /var/www/likeornot/frontend/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /var/www/likeornot/backend/staticfiles/;
    }

    location /media/ {
        alias /var/www/likeornot/backend/media/;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/likeornot /etc/nginx/sites-enabled/likeornot
sudo nginx -t
sudo systemctl restart nginx
```

## 7. HTTPS

If your domain is already pointing to the server:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d likeornot.example.com -d www.likeornot.example.com
```

## 8. Update after new push

```bash
cd /var/www/likeornot
git pull

cd backend
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

cd ../frontend
npm install
npm run build

sudo systemctl restart likeornot
sudo systemctl restart nginx
```
