# Company Projects

Aplikacija za upravljanje kompanijama, projektima i korisnicima: korisnik pripada jednoj (glavnoj) kompaniji,
a moze biti clan projekata i drugih kompanija, sa ulogom na svakom projektu. Projekti imaju galeriju slika.

| Deo | Tehnologija | Folder |
|---|---|---|
| Backend: REST API + 2 Blade stranice | Laravel 13, PHP 8.3, MySQL | `backend/` |
| Frontend | React 19 + Vite 8 + Tailwind CSS 4 | `frontend/` |
| API kolekcija | Bruno | `bruno/` |
| Opis baze (kolone, veze, odgovori na pitanja) | | [`docs/baza.md`](docs/baza.md) |
| Tekst zadatka | | [`ZADATAK.md`](ZADATAK.md) |

---

## 1. Potrebni programi

| Program | Verzija | Provera |
|---|---|---|
| PHP | 8.3 ili novija, sa ekstenzijama `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `curl`, `zip` | `php -v` i `php -m` |
| Composer | 2.x | `composer -V` |
| Node.js (LTS) + npm | Node 20.19+ ili 22.12+ | `node -v` i `npm -v` |
| MySQL | 8 ili noviji | `mysql --version` |
| Git | bilo koja novija | `git --version` |

Komande ispod su za **Windows (PowerShell)**. Na macOS/Linux umesto `copy` koristi `cp`.

---

## 2. Pokretanje od nule

### 2.1 Preuzimanje projekta

```powershell
git clone https://github.com/Muhamed254683/company-projects.git
cd company-projects
```

### 2.2 Baza

Prijavi se u MySQL (trazi lozinku; dok kucas, na ekranu se nista ne vidi):

```powershell
mysql -u root -p
```

Napravi bazu i izadji:

```sql
CREATE DATABASE company_projects CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2.3 Backend (Laravel)

```powershell
cd backend
composer install
copy .env.example .env
```

Otvori `backend/.env` i upisi lozinku za MySQL: `DB_PASSWORD=tvoja_lozinka`
(ako koristis drugog korisnika ili drugo ime baze, promeni i `DB_USERNAME` / `DB_DATABASE`).

Zatim:

```powershell
php artisan key:generate     # tajni kljuc aplikacije (upisuje se u .env)
php artisan migrate --seed   # tabele + realni test podaci (5 firmi, 32 korisnika + admin, 15 projekata, od toga 1 u korpi)
php artisan storage:link     # da bi slike projekata bile vidljive u browseru
npm install                  # Tailwind/Vite za Blade stranice
npm run build                # pravi CSS za Blade stranice (public/build)
php artisan serve            # backend na http://localhost:8000
```

Ostavi ovaj terminal otvoren (server radi dok ga ne zaustavis sa **Ctrl+C**).

### 2.4 Frontend (React) — u **novom** terminalu

```powershell
cd company-projects\frontend
npm install
copy .env.example .env
npm run dev                  # aplikacija na http://localhost:5173
```

### 2.5 Otvori u browseru

| Adresa | Sta je |
|---|---|
| http://localhost:5173 | **React aplikacija**: kompanije, projekti, korisnici (CRUD), detalji projekta sa clanovima i galerijom |
| http://localhost:8000 | **Dashboard** (Blade): statistika i poslednji projekti |
| http://localhost:8000/showcase/crm-sistem-iris | **Javna stranica projekta** (Blade); slug zavisi od podataka, linkovi su na dashboard-u |
| http://localhost:8000/api/companies | REST API (JSON) |

**Prijava u React aplikaciju:** `admin@example.com` / `password` (pravi ga seeder), ili napravi svoj nalog
na stranici **Registracija** (http://localhost:5173/register; link je i na stranici za prijavu).
Svi korisnici iz seedera imaju lozinku `password`. Na bazi koja je napravljena ranije, bez admin naloga:
`php artisan db:seed --class=AdminUserSeeder` (u `backend/`; dodaje samo taj nalog).
Dashboard i javna stranica projekta (Blade) ne traze prijavu.

---

## 3. Svakodnevni rad

Posle prvog podesavanja dovoljna su dva terminala:

```powershell
# terminal 1
cd backend
php artisan serve

# terminal 2
cd frontend
npm run dev
```

Sveza baza sa novim test podacima (**brise sve podatke**, samo lokalno):

```powershell
cd backend
php artisan migrate:fresh --seed
```

Ako menjas izgled Blade stranica (`backend/resources/views`), ponovo pokreni `npm run build` u `backend/`
(ili `npm run dev` u `backend/` dok radis, da se promene vide odmah).

---

## 4. Testovi i provera koda

| Sta | Komanda | Gde |
|---|---|---|
| Backend testovi (PHPUnit) | `php artisan test` | `backend/` |
| PHP stil (Laravel Pint) | `vendor\bin\pint --test` | `backend/` |
| JS lint (oxlint) | `npm run lint` | `frontend/` |
| API kolekcija | Bruno, vidi ispod | `bruno/` |

Backend testovi koriste **posebnu SQLite bazu u memoriji** (`phpunit.xml`), pa ne diraju MySQL bazu.
Pokrivaju: obe Blade stranice, pravila za `slug`, brisanje slika sa diska (pri brisanju slike, projekta i kompanije),
pretragu i filtere na listama, korpu za projekte (soft delete), prijavu i registraciju (token, odjava, 401, ogranicenje pokusaja)
i `ProjectFactory` za veliki broj projekata.

### Bruno kolekcija

1. U Brunu: **Open Collection** -> folder `bruno/`.
2. Gore desno izaberi okruzenje **Local**.
3. Pokreni celu kolekciju (**Run**). Zahtevi su povezani promenljivama (npr. `company_id`), pa ih pokreci redom.
   Kolekcija na kraju brise sve sto je napravila.
4. Prvi zahtev (`00 Auth / Login`) se prijavljuje kao `admin@example.com` i cuva token; header
   `Authorization: Bearer {{token}}` iz `collection.bru` vazi za sve zahteve. Pojedinacan zahtev: prvo pokreni `Login`.
   `00 Auth / Register` pravi novog korisnika (admin ga brise na kraju, u `06 Logout`). Registracija je ogranicena
   na 3 u minuti po IP-u: ako kolekciju pokreces vise puta zaredom, izmedju pokretanja sacekaj minut.

---

## 5. Sta aplikacija radi

**React (http://localhost:5173)**
- **Prijava:** bez prijave se vidi samo stranica "Prijava"; posle prijave vraca na stranicu na koju si krenuo.
  U navbaru su ime prijavljenog korisnika i "Odjavi se". Kad token istekne, aplikacija vraca na prijavu sa porukom.
  Na listi korisnika sopstveni nalog nema dugme "Obriši".
- **Registracija** (`/register`): svako moze da napravi nalog (ime, prezime, email, lozinka dva puta) i odmah je prijavljen.
  Nov korisnik je bez kompanije; kompanija se podesava kroz "Izmeni" na stranici Users.
- Kompanije, projekti, korisnici: lista sa paginacijom, dodavanje i izmena (ista forma), brisanje uz potvrdu.
- **Notifikacije:** posle svake uspesne akcije (cuvanje, brisanje, korpa, clanovi, slike) dole desno se pojavi kratka poruka;
  zelena nestaje posle 4 s, crvena (neocekivana greska, npr. server ne radi) posle 8 s; dok je mis iznad nje, ne nestaje.
  Posle premestanja projekta u korpu poruka ima dugme "Poništi". Greske validacije su i dalje ispod polja u formi.
- **Korpa za projekte (soft delete):** "Obriši" premesta projekat u korpu (slike i clanovi ostaju sacuvani).
  Na listi projekata prekidac "Aktivni | Korpa"; iz korpe projekat moze da se vrati ("Vrati") ili obrise trajno
  ("Obriši trajno", tek tada se brisu i slike sa diska).
- Pretraga i filteri iznad svake liste (kompanije: grad; korisnici: kompanija ili "bez kompanije"; projekti: kompanija i status).
  Pretraga krece 300 ms posle poslednjeg slova, ne razlikuje mala/velika slova ni kvacice ("bondzulic" nalazi "Bondžulić",
  "djurasin" nalazi "Đurašin"), a filteri su u adresi stranice, pa link sa filterima moze da se posalje nekome.
- Greske validacije iz Laravela prikazuju se ispod odgovarajucih polja.
- Detalji projekta: clanovi sa ulogama (dodavanje i uklanjanje); clanovi iz druge firme i frilenseri su oznaceni zuto.
- Galerija: upload vise slika odjednom (jpg/png/webp, do 2 MB po slici, 7,5 MB ukupno, 10 slika), uvecanje, brisanje (i sa diska).
  Velicina se proverava vec u browseru, pre slanja.

**Blade (http://localhost:8000)** — Laravel ih pravi direktno iz baze, ne preko API-ja
- `/` dashboard: broj kompanija, projekata i korisnika, projekti po statusu, poslednji projekti.
- `/showcase/{slug}` javna stranica projekta: opis, kompanija, galerija, tim (bez emailova i budzeta).

### API

| Resurs | Endpointi |
|---|---|
| Prijava | `POST /api/login` (email, password -> `{ token, user }`), `POST /api/register` (201, `{ token, user }`), `POST /api/logout`, `GET /api/me` |
| Kompanije | `GET/POST /api/companies`, `GET/PUT/DELETE /api/companies/{id}` |
| Korisnici | `GET/POST /api/users`, `GET/PUT/DELETE /api/users/{id}` |
| Projekti | `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/{id}` (DELETE = u korpu) |
| Korpa projekata | `GET /api/projects?trashed=only`, `POST /api/projects/{id}/restore`, `DELETE /api/projects/{id}/force` (trajno, samo iz korpe) |
| Clanovi projekta | `GET/POST /api/projects/{id}/members`, `DELETE /api/projects/{id}/members/{user_id}` |
| Slike projekta | `POST /api/projects/{id}/images`, `DELETE /api/projects/{id}/images/{image_id}` |

- Svaki zahtev treba da ima header `Accept: application/json`.
- **Prijava (Laravel Sanctum, token):** svi endpointi osim `POST /api/login` i `POST /api/register` traze header
  `Authorization: Bearer <token>` (inace 401). Token vazi 7 dana (`SANCTUM_EXPIRATION`); `logout` brise samo token te prijave.
  Najvise 5 pokusaja prijave u minuti za isti email i IP, i 3 registracije u minuti po IP-u (zatim 429).
  Korisnik ne moze da obrise sam sebe (403).
- **Registracija:** `first_name`, `last_name`, `email` (jedinstven), `password` (najmanje 8 znakova) i `password_confirmation`.
- Liste su paginirane: `?page=1&per_page=15` (najvise 100).
- Pretraga i filteri (pogresna vrednost filtera vraca 422):

  | Lista | `search` trazi u | Filteri |
  |---|---|---|
  | `/api/companies` | naziv, PIB, grad, email | `city=Beograd` |
  | `/api/users` | ime, prezime, email, pozicija | `company_id=3`, `company_id=none` (bez kompanije) |
  | `/api/projects` | naziv, opis | `company_id=2`, `status=planned/active/on_hold/completed` |

  Vise reci znaci da svaka mora da se nadje: `?search=milin bolic`.
- Slike: `multipart/form-data`, polje `images[]`, jpg/png/webp, najvise 2 MB po slici i 10 po zahtevu;
  ceo zahtev najvise 8 MB (PHP: `upload_max_filesize = 2M`, `post_max_size = 8M` u `php.ini`).
- Izmena sa fajlovima (`multipart/form-data`) ide kao `POST` sa poljem `_method=PUT`,
  jer PHP ne cita multipart telo kod pravih `PUT` zahteva.

### Frontend skripte (`frontend/`)

| Skripta | Sta radi |
|---|---|
| `npm run dev` | Razvojni server sa trenutnim osvezavanjem (HMR); nista se ne pise na disk. Za svakodnevni rad. |
| `npm run watch` | Produkcijski build u `dist/` koji se ponavlja pri svakoj izmeni fajla; `dist/` mora da servira neko drugi. |
| `npm run build` | Jednokratni produkcijski build u `dist/`. |
| `npm run preview` | Servira gotov `dist/` lokalno, da se proveri build. |
| `npm run lint` | Provera koda (oxlint). |

---

## 6. Podesavanja (`.env`)

Lozinke i adrese su u `.env` fajlovima (nisu u Git-u); sabloni sa objasnjenjima su `.env.example`.

| Fajl | Bitno |
|---|---|
| `backend/.env` | `DB_*` (baza), `APP_URL` (adresa backenda, od nje se prave URL-ovi slika), `FRONTEND_URL` (CORS: ko sme da zove API iz browsera), `SANCTUM_EXPIRATION` (koliko minuta vazi token za prijavu; 10080 = 7 dana) |
| `frontend/.env` | `VITE_API_URL` (adresa API-ja). Upisuje se u kod pri build-u: posle promene treba novi build. |

---

## 7. Cesti problemi

| Problem | Resenje |
|---|---|
| Prijava: "The email or password is incorrect." za `admin@example.com` | Admin nalog ne postoji u toj bazi: `php artisan db:seed --class=AdminUserSeeder` u `backend/`. |
| Prijava: "Previše pokušaja prijave" (429) | 5 pogresnih pokusaja u minuti; sacekaj minut. |
| Registracija: "Previše pokušaja registracije" (429) | Najvise 3 registracije u minuti sa iste IP adrese; sacekaj minut. |
| API ili Bruno vracaju 401 "Unauthenticated." | Zahtev nema vazeci token: prvo `POST /api/login` (u Brunu zahtev `Login`), pa `Authorization: Bearer <token>`. |
| `SQLSTATE[HY000] [1045] Access denied` | Pogresan `DB_USERNAME` / `DB_PASSWORD` u `backend/.env`. Posle izmene: `php artisan config:clear`. |
| `SQLSTATE[HY000] [1049] Unknown database` | Baza nije napravljena: korak 2.2. |
| `Vite manifest not found` na http://localhost:8000 | U `backend/` nije pokrenut `npm install` i `npm run build`. |
| Slike se ne vide (HTTP 403 na `/storage/...`) | U `backend/` nije pokrenut `php artisan storage:link`. |
| React javlja "Server ne odgovara. Proveri da li backend radi" | Backend ne radi (`php artisan serve`), ili adresa frontenda nije u `FRONTEND_URL` (CORS), ili je pogresan `VITE_API_URL`. |
| `npm run dev` javlja `Cannot find native binding` | Poznat npm bag: obrisi `node_modules` i `package-lock.json`, pa ponovo `npm install`. |
| Upload preko API-ja (npr. Bruno): "failed to upload" ili "The POST data is too large." | Slika je veca od 2 MB, ili su sve zajedno vece od 8 MB (`upload_max_filesize` / `post_max_size` u `php.ini`). React aplikacija ovo proverava pre slanja i javlja na srpskom. |
| Vite pokrene frontend na portu 5174 | Port 5173 je zauzet; zatvori drugi Vite ili dodaj novu adresu u `FRONTEND_URL` u `backend/.env`. |

---

## 8. Poznata ograničenja

- **Prijava bez uloga + otvorena registracija:** svaki prijavljen korisnik moze sve, a registrovati se moze bilo ko.
  Znaci: svako ko otvori aplikaciju moze da napravi nalog i dobije pun pristup (brisanje firmi, projekata, korisnika).
  U redu za lokalni rad i demonstraciju; prava aplikacija bi imala uloge, odobravanje novih naloga ili pozivnice.
- **Nema potvrde emaila ni "zaboravljena lozinka"** (za to bi trebalo slanje mejlova). Lozinku drugog korisnika
  moze da promeni prijavljen korisnik kroz "Izmeni" na stranici Users.
- **Token je u `localStorage`** browsera: jednostavno, ali zlonamerni JavaScript (XSS) bi mogao da ga procita.
  Aplikacija svuda escapuje tekst; sigurnija varijanta je Sanctum SPA prijava preko kolacica.
- **Padajuce liste** (izbor kompanije u formama, izbor novog clana projekta) ucitavaju **najvise 100 stavki**,
  jer API vraca najvise 100 redova po strani. Za vecu bazu trebalo bi polje za pretragu umesto liste.
- **Poruke validacije su na engleskom** (dolaze iz Laravela, npr. "The name field is required."), a interfejs je na srpskom.
