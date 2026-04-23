## Bucket List Viaggi - Progetto Applicazioni Web 2025/26

## Descrizione

Applicazione web per la gestione di una wishlist di viaggi.
Ogni utente può creare, visualizzare, modificare ed eliminare le proprie
destinazioni di viaggio, con integrazione meteo e generazione itinerari AI.

## Autori

- Filippo Pivetta - Matricola: 157031
- Gabriele Miani - Matricola: 158357
- Francesco Marcato - Matricola: 153217

## Tecnologie

- Backend: Node.js, Express.js
- Frontend: HTML5, CSS3, JavaScript ES6+, Tailwind CSS (CDN)
- Persistenza: file `data.json`
- API esterne: OpenWeatherMap, OpenAI

## Installazione ed esecuzione

```bash
git clone https://github.com/utente/progetto-webapp-2026-pivetta-miani-marcato.git
cd progetto-webapp-2026-pivetta-miani-marcato
npm install
```

Creare un file `.env` nella root con:

```bash
OPENWEATHER_API_KEY=la_tua_chiave_openweather
OPENAI_API_KEY=la_tua_chiave_openai
```

Avviare il server:

```bash
npm start
```

L'app è disponibile su `http://localhost:3000`.

## Endpoint REST

| Metodo | Percorso                      | Descrizione                    | Auth | Status              |
|--------|-------------------------------|--------------------------------|------|---------------------|
| GET    | /destinations                 | Lista con ricerca e paginazione | No   | 200                 |
| GET    | /destinations/:id             | Dettaglio singola destinazione | No   | 200/404             |
| POST   | /destinations                 | Crea nuova destinazione        | Sì   | 201/400             |
| PUT    | /destinations/:id             | Aggiorna o crea (upsert)      | Sì   | 200/201/400/403     |
| DELETE | /destinations/:id             | Elimina destinazione          | Sì   | 204/403/404         |
| POST   | /login                        | Autenticazione utente         | No   | 200/400/401         |
| GET    | /destinations/:id/weather     | Meteo della destinazione      | No   | 200/404/500         |
| POST   | /destinations/:id/itinerary   | Genera itinerario AI          | Sì   | 200/404/500         |

## Parametri ricerca e paginazione

```bash
GET /destinations?q=tokyo&limit=10&offset=0
```

- `q`: ricerca testuale su nome e paese (case-insensitive)
- `limit`: numero massimo risultati (default: 10)
- `offset`: indice di partenza (default: 0)
- `visitato`: filtra per stato di visita (`true` o `false`)
- `mine`: se `true`, restituisce solo le destinazioni dell'utente autenticato (richiede header `X-Auth-Token`)

Risposta:

```json
{
  "results": [...],
  "total": 83
}
```

## Esempi curl

### GET /destinations

```bash
curl -X GET "http://localhost:3000/destinations?q=tokyo&limit=10&offset=0"
```

### GET /destinations/:id

```bash
curl -X GET "http://localhost:3000/destinations/1"
```

### POST /destinations

```bash
curl -X POST "http://localhost:3000/destinations" \
  -H "Content-Type: application/json" \
  -H "X-Auth-Token: token-1" \
  -d '{
    "nome": "Roma",
    "paese": "Italia",
    "costo_stimato": 600,
    "durata_giorni": 4,
    "visitato": false
  }'
```

### PUT /destinations/:id

```bash
curl -X PUT "http://localhost:3000/destinations/1" \
  -H "Content-Type: application/json" \
  -H "X-Auth-Token: token-1" \
  -d '{
    "costo_stimato": 2600,
    "visitato": true
  }'
```

### DELETE /destinations/:id

```bash
curl -X DELETE "http://localhost:3000/destinations/1" \
  -H "X-Auth-Token: token-1"
```

### POST /login

```bash
curl -X POST "http://localhost:3000/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "pass123"
  }'
```

### GET /destinations/:id/weather

```bash
curl -X GET "http://localhost:3000/destinations/1/weather"
```

### POST /destinations/:id/itinerary

```bash
curl -X POST "http://localhost:3000/destinations/1/itinerary" \
  -H "X-Auth-Token: token-1"
```

## Struttura del progetto

```text
progetto-webapp-2026-pivetta-miani-marcato/
├── backend/
│   ├── server.js
│   ├── routes/
│   │   └── destinations.js
│   ├── data/
│   │   └── destinationsStore.js
│   ├── validation/
│   │   └── destinationsValidator.js
│   └── data.json
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── assets/
│       └── hero.jpg
├── .env
├── .gitignore
└── README.md
```

## Utenti di test

| Username | Password |
|----------|----------|
| alice    | pass123  |
| bob      | secret456 |
