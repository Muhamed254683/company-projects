# company-projects

Aplikacija za upravljanje kompanijama, projektima i korisnicima.

| Deo | Tehnologija | Folder |
|---|---|---|
| Backend (REST API) | Laravel 13, PHP 8.3, MySQL | `backend/` |
| Frontend | React 19 + Vite 8 + Tailwind CSS 4 | `frontend/` |
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

## Pokretanje frontenda (lokalno)

Potrebno: Node (LTS) i npm. Backend mora da radi (`php artisan serve`).

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev                  # aplikacija na http://localhost:5173
```

U `frontend/.env` je adresa API-ja: `VITE_API_URL=http://localhost:8000/api`.
Vite pusta u frontend samo promenljive koje pocinju sa `VITE_` i one zavrse u JavaScript-u
koji browser preuzme, pa tu nikad ne idu lozinke ni tajni kljucevi.

> Ako `npm run dev` javi `Cannot find native binding`, obrisi `node_modules` i
> `package-lock.json` i ponovo pokreni `npm install` (poznat npm bag sa opcionim paketima).

| Skripta | Sta radi |
|---|---|
| `npm run dev` | Razvojni server sa trenutnim osvezavanjem (HMR); nista se ne pise na disk. Za svakodnevni rad. |
| `npm run watch` | Produkcijski build u `dist/` koji se ponavlja pri svakoj izmeni fajla; `dist/` mora da servira neko drugi. |
| `npm run build` | Jednokratni produkcijski build u `dist/`. |
| `npm run preview` | Servira gotov `dist/` lokalno, da se proveri build. |

`VITE_API_URL` se upisuje u JavaScript **u trenutku builda**, pa posle promene adrese API-ja treba novi build.

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
