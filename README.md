## Bucket List Viaggi — Progetto Applicazioni Web 2024/25

## Descrizione

Applicazione web per la gestione di una wishlist di viaggi.
Ogni utente può creare, visualizzare, modificare ed eliminare le proprie
destinazioni di viaggio, con integrazione meteo e generazione itinerari AI.

## Autori

- Filippo Pivetta — Matricola: 157031
- Gabriele Miani — Matricola: 157032
- Francesco Marcato — Matricola: 157033

## Tecnologie

- Backend: Node.js, Express.js
- Frontend: HTML5, CSS3, JavaScript ES6+, Tailwind CSS (CDN)
- Persistenza: file `data.json`
- API esterne: OpenWeatherMap, OpenAI

## Installazione ed esecuzione

```bash
git clone https://github.com/utente/progetto-webapp-2024-cognome1-cognome2-cognome3.git
cd progetto-webapp-2024-cognome1-cognome2-cognome3
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
| GET    | /destinations/:id/weather     | Meteo della destinazione      | No   | 200/404             |
| POST   | /destinations/:id/itinerary   | Genera itinerario AI          | Sì   | 200/404/500         |

## Parametri ricerca e paginazione

```bash
GET /destinations?q=tokyo&limit=10&offset=0
```

- `q`: ricerca testuale su nome e paese (case-insensitive)
- `limit`: numero massimo risultati (default: 10)
- `offset`: indice di partenza (default: 0)

Risposta:

```json
{
  "results": [...],
  "total": 83
}
```
