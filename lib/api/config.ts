export const DJANGO_API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";

export const DJANGO_UNAVAILABLE_MESSAGE =
  "Impossible de joindre le backend Django. Vérifiez que `python manage.py runserver` est lancé sur le port 8000.";
