const express = require('express');
const {
  getAllDestinations,
  getDestinationById,
  createDestination,
  createDestinationWithId,
  updateDestination,
  deleteDestination,
} = require('../data/destinationsStore');
const {
  validateDestination,
  validatePartialDestination,
} = require('../validation/destinationsValidator');

const router = express.Router();

router.get('/destinations', async (req, res) => {
  try {
    const q = (req.query.q || '').toString();
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = parseInt(req.query.offset, 10) || 0;
    const visitatoParam = req.query.visitato;
    const mine = req.query.mine === 'true';

    let requestingUserId = null;
    if (mine) {
      const tokenHeader = req.headers['x-auth-token'];
      if (tokenHeader) {
        const parsed = parseInt(String(tokenHeader).replace('token-', ''), 10);
        if (!Number.isNaN(parsed) && parsed > 0) requestingUserId = parsed;
      }
    }

    const all = await getAllDestinations();
    let filtered = all;

    if (q && q.trim() !== '') {
      const query = q.trim().toLowerCase();
      filtered = filtered.filter((d) => {
        const nome = (d.nome || '').toLowerCase();
        const paese = (d.paese || '').toLowerCase();
        return nome.includes(query) || paese.includes(query);
      });
    }

    if (mine && requestingUserId !== null) filtered = filtered.filter((d) => d.ownerId === requestingUserId);
    if (visitatoParam === 'true') filtered = filtered.filter((d) => d.visitato === true);
    else if (visitatoParam === 'false') filtered = filtered.filter((d) => d.visitato === false);

    const total = filtered.length;
    const results = filtered.slice(offset, offset + limit);
    res.status(200).json({ results, total });
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.get('/destinations/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const destination = await getDestinationById(id);
    if (!destination) { res.status(404).json({ error: 'Destination not found' }); return; }
    res.status(200).json(destination);
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.post('/destinations', async (req, res) => {
  try {
    const errors = validateDestination(req.body || {});
    if (errors.length > 0) { res.status(400).json({ error: errors.join('; ') }); return; }
    const { nome, paese, costo_stimato, durata_giorni, visitato } = req.body;
    const destination = await createDestination({ nome, paese, costo_stimato, durata_giorni, visitato }, req.userId);
    res.status(201).json(destination);
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.put('/destinations/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const body = req.body || {};
    const existing = await getDestinationById(id);
    if (existing) {
      if (existing.ownerId !== req.userId) { res.status(403).json({ error: 'Non sei il proprietario' }); return; }
      const errors = validatePartialDestination(body);
      if (errors.length > 0) { res.status(400).json({ error: errors.join('; ') }); return; }
      const updated = await updateDestination(id, body);
      if (!updated) { res.status(404).json({ error: 'Destination not found' }); return; }
      res.status(200).json(updated);
      return;
    }
    const errors = validateDestination(body);
    if (errors.length > 0) { res.status(400).json({ error: errors.join('; ') }); return; }
    const { nome, paese, costo_stimato, durata_giorni, visitato } = body;
    const created = await createDestinationWithId(id, { nome, paese, costo_stimato, durata_giorni, visitato }, req.userId);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.delete('/destinations/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await getDestinationById(id);
    if (!existing) { res.status(404).json({ error: 'Destination not found' }); return; }
    if (existing.ownerId !== req.userId) { res.status(403).json({ error: 'Non sei il proprietario' }); return; }
    const deleted = await deleteDestination(id);
    if (!deleted) { res.status(404).json({ error: 'Destination not found' }); return; }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.get('/destinations/:id/weather', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const destination = await getDestinationById(id);
    if (!destination) { res.status(404).json({ error: 'Destination not found' }); return; }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) { res.status(500).json({ error: 'Servizio meteo non configurato' }); return; }

    const q = destination.nome + ',' + destination.paese;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&appid=${apiKey}&units=metric&lang=it`;
    const response = await fetch(url);
    if (!response.ok) { res.status(404).json({ error: 'Meteo non disponibile per questa destinazione' }); return; }

    const data = await response.json();
    const citta = destination.nome;
    const temperatura = data?.main?.temp;
    const descrizione = data?.weather?.[0]?.description;
    const icona = data?.weather?.[0]?.icon;
    const umidita = data?.main?.humidity;
    const ventoMs = data?.wind?.speed;
    const vento_kmh = typeof ventoMs === 'number' ? Math.round(ventoMs * 3.6) : null;

    if (typeof temperatura !== 'number' || typeof descrizione !== 'string' || typeof icona !== 'string' || typeof umidita !== 'number' || vento_kmh === null) {
      res.status(404).json({ error: 'Meteo non disponibile per questa destinazione' });
      return;
    }

    res.status(200).json({ citta, temperatura, descrizione, icona, icona_url: `https://openweathermap.org/img/wn/${icona}@2x.png`, umidita, vento_kmh });
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.post('/destinations/:id/itinerary', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const destination = await getDestinationById(id);
    if (!destination) { res.status(404).json({ error: 'Destination not found' }); return; }

    const apiKeyRaw = process.env.OPENAI_API_KEY;
    const apiKey = String(apiKeyRaw || '').trim();
    if (!apiKey) { res.status(500).json({ error: 'Servizio AI non configurato' }); return; }

    const prompt = `Sei una guida turistica esperta. Crea un itinerario di viaggio per ${destination.nome}, ${destination.paese}.
Durata del viaggio: ${destination.durata_giorni} giorni. Budget stimato: €${destination.costo_stimato}.
Fornisci esattamente 3 attività consigliate per ogni giorno, in italiano, in formato JSON con questa struttura:
{ "giorni": [{ "giorno": 1, "attivita": ["...", "...", "..."] }, ...] }`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) { res.status(500).json({ error: 'Impossibile generare itinerario' }); return; }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    let itinerary;
    try {
      itinerary = JSON.parse(content);
    } catch (parseError) {
      throw parseError;
    }
    res.status(200).json(itinerary);
  } catch (error) {
    res.status(500).json({ error: 'Impossibile generare itinerario' });
  }
});

module.exports = router;
