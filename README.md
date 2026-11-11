# company-projects

Aplikacija za upravljanje kompanijama, projektima i korisnicima.

| Deo | Tehnologija | Folder |
|---|---|---|
| Backend (REST API) | Laravel 13, PHP 8.3, MySQL | `backend/` |
| Frontend | React + Vite + Tailwind CSS | `frontend/` (u izradi) |
| API kolekcija | Bruno | `bruno/` |

## Pokretanje backenda (lokalno)

Potrebno: PHP 8.3, Composer, MySQL.

```powershell
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

U `.env` upisi podatke za bazu (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`),
pa napravi bazu u MySQL-u:

```sql
CREATE DATABASE company_projects CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Zatim:

```powershell
php artisan migrate --seed   # tabele + test podaci
php artisan storage:link     # da bi slike projekata bile vidljive u browseru
php artisan serve            # API na http://localhost:8000/api
```

> `storage:link` pravi precicu `public/storage` -> `storage/app/public`.
> Precica nije u Git-u, pa se ovaj korak radi jednom na svakom racunaru.

Sveza baza sa novim test podacima (samo lokalno, brise sve):

```powershell
php artisan migrate:fresh --seed
```

## API

| Resurs | Endpointi |
|---|---|
| Kompanije | `GET/POST /api/companies`, `GET/PUT/DELETE /api/companies/{id}` |
| Korisnici | `GET/POST /api/users`, `GET/PUT/DELETE /api/users/{id}` |
| Projekti | `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/{id}` |
| Clanovi projekta | `GET/POST /api/projects/{id}/members`, `DELETE /api/projects/{id}/members/{user_id}` |
| Slike projekta | `POST /api/projects/{id}/images`, `DELETE /api/projects/{id}/images/{image_id}` |

- Liste su paginirane: `?page=1&per_page=15`.
- Svaki zahtev treba da ima header `Accept: application/json`.
- Slike: `multipart/form-data`, polje `images[]`, jpg/png/webp, najvise 2 MB po slici.
- Izmena sa fajlovima (`multipart/form-data`) ide kao `POST` sa poljem `_method=PUT`,
  jer PHP ne cita multipart telo kod pravih `PUT` zahteva.
- CORS: dozvoljene adrese frontenda su u `FRONTEND_URL` u `backend/.env`.

## Bruno kolekcija

1. U Brunu: **Open Collection** -> folder `bruno/`.
2. Gore desno izaberi okruzenje **Local**.
3. Pokreni celu kolekciju (**Run**). Zahtevi su povezani promenljivama, pa ih pokreci redom.
   Kolekcija na kraju brise sve sto je napravila.
