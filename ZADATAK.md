Zadatak: Companies & Projects aplikacija
Cilj
Napravićeš aplikaciju za upravljanje kompanijama, projektima i korisnicima. Backend je Laravel (REST API + 2 Blade stranice), frontend je React, a baza MySQL. Sve se pokreće lokalno na tvom računaru, bez Dockera. Docker dolazi u sledećoj iteraciji, pa piši kod imajući to na umu.

Stack: PHP · Laravel · Blade · MySQL · Node · npm · React · Vite · Tailwind CSS

Struktura projekta
Jedan Git repozitorijum, dva odvojena projekta:

company-projects/
├── backend/     → Laravel (API + Blade stranice)
├── frontend/    → React + Vite + Tailwind
└── README.md
Zahtevi za bazu podataka
Napravi tabele companies, users, projects i ono što je potrebno da ih povežeš.

Pravila:

Jedna kompanija može imati više projekata.
Jedan korisnik pripada jednoj (glavnoj) kompaniji.
Korisnik može biti član više projekata, uključujući i projekte koji ne pripadaju njegovoj kompaniji.
Svaki član projekta ima ulogu na tom projektu (npr. manager, developer...).
Svaki projekat može imati više slika.
Tvoj zadatak: istraži i osmisli kolone za svaku tabelu. Razmišljaj kao da je ovo prava aplikacija: šta firma, korisnik i projekat realno treba da imaju? Budi kreativan, ali svaku kolonu moraš znati da obrazložiš.

Razmisli i odgovori:

Koliko tabela ti zapravo treba za ove veze i zašto?
Šta treba da se desi sa projektima i korisnicima kada se obriše kompanija?
Šta se dešava sa slikama na disku kada se obriše projekat?
Faze rada
Faza 0 – Okruženje
Instaliraj PHP, Composer, Node (LTS), MySQL i Git.
Proveri verzije komandama u terminalu.
Napravi repo na GitHub-u.
Faza 1 – Laravel kostur
Napravi Laravel projekat u folderu backend/.
Napravi MySQL bazu i poveži je preko .env.
Pokreni migracije i server (php artisan serve).
Faza 2 – Baza podataka
Migracije za sve tabele.
Modeli sa Eloquent vezama.
Factories i seeders koji pune bazu realnim test podacima, uključujući korisnike koji su članovi projekata drugih kompanija.
Testiraj veze u php artisan tinker.
Faza 3 – REST API
CRUD endpointi za companies, users i projects.
Endpointi za dodavanje i uklanjanje članova projekta.
Endpointi za upload i brisanje slika projekta.
Validacija svih ulaznih podataka (istraži Form Requests).
Oblikovanje JSON odgovora (istraži API Resources).
Paginacija na listama.
Podesi CORS da React može da pristupi API-ju.
Testiraj sve u Postman-u ili Bruno-u i sačuvaj kolekciju u repo.
Faza 4 – Slike
Upload slika za projekat, čuvanje u Laravel storage-u.
Validacija (tip fajla, veličina).
Slike moraju da se vide na frontendu i da se brišu i sa diska.
Hint: istraži php artisan storage:link. Ako upload ne radi pri izmeni, istraži zašto PHP i PUT zahtevi ne rade dobro sa fajlovima.
Faza 5 – React kostur
Napravi React projekat sa Vite-om u folderu frontend/.
Instaliraj i podesi Tailwind CSS.
Podesi rutiranje (react-router-dom).
Napravi navbar sa linkovima: Companies, Projects, Users.
URL API-ja mora da bude u .env fajlu, ne hardkodovan.
Dodaj watch skriptu u package.json i objasni razliku između npm run dev i npm run watch.
Faza 6 – CRUD stranice
Za svaki entitet (companies, projects, users):

Lista: tabela sa paginacijom
Dodavanje: forma
Izmena: forma (pokušaj da iskoristiš istu komponentu kao za dodavanje)
Brisanje: uz potvrdu korisnika
Stranica detalja projekta:

Galerija slika (upload i brisanje)
Lista članova sa ulogama i dodavanje novih članova
Vizuelno označi članove koji su iz druge kompanije
Prikaži greške validacije koje vraća Laravel ispod odgovarajućih polja. Napravi zajedničke komponente (input, dugme, modal...) umesto da ponavljaš kod.
Faza 7 – Blade stranice
Ove dve stranice renderuje Laravel direktno iz baze, ne preko API-ja:
- Dashboard (/): statistika (broj kompanija, projekata i korisnika, projekti po statusu) i poslednji projekti.
- Prikaz projekta (/showcase/{slug}): javna stranica projekta sa opisom, kompanijom, galerijom i timom.
Koristi Blade layout i Tailwind.

Faza 8 – Završetak
- README sa uputstvom kako se projekat pokreće od nule.
- .env.example za oba projekta.
- Očisti kod.

Zadatak je gotov kada:
[ ] Neko drugi može da pokrene projekat prateći samo README
[ ] Seeder puni bazu realnim podacima
[ ] CRUD radi za sva tri entiteta, sa validacijom
[ ] Projekat može imati članove iz druge kompanije i to se vidi u aplikaciji
[ ] Slike se dodaju, prikazuju i brišu
[ ] Obe Blade stranice rade
[ ] API kolekcija je u repou

Bonus (ako ostane vremena): pretraga i filteri na listama, soft delete za projekte, login (Laravel Sanctum), sortiranje slika, notifikacije posle uspešnih akcija.