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
    const all = await getAllDestinations();
    res.status(200).json({ results: all, total: all.length });
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.get('/destinations/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const destination = await getDestinationById(id);
    if (!destination) {
      res.status(404).json({ error: 'Destination not found' });
      return;
    }
    res.status(200).json(destination);
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.post('/destinations', async (req, res) => {
  try {
    const errors = validateDestination(req.body || {});
    if (errors.length > 0) {
      res.status(400).json({ error: errors.join('; ') });
      return;
    }
    const { nome, paese, costo_stimato, durata_giorni, visitato } = req.body;
    const destination = await createDestination(
      { nome, paese, costo_stimato, durata_giorni, visitato },
      req.userId
    );
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
      if (existing.ownerId !== req.userId) {
        res.status(403).json({ error: 'Non sei il proprietario' });
        return;
      }
      const errors = validatePartialDestination(body);
      if (errors.length > 0) {
        res.status(400).json({ error: errors.join('; ') });
        return;
      }
      const updated = await updateDestination(id, body);
      if (!updated) {
        res.status(404).json({ error: 'Destination not found' });
        return;
      }
      res.status(200).json(updated);
      return;
    }

    const errors = validateDestination(body);
    if (errors.length > 0) {
      res.status(400).json({ error: errors.join('; ') });
      return;
    }
    const { nome, paese, costo_stimato, durata_giorni, visitato } = body;
    const created = await createDestinationWithId(
      id,
      { nome, paese, costo_stimato, durata_giorni, visitato },
      req.userId
    );
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.delete('/destinations/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await getDestinationById(id);
    if (!existing) {
      res.status(404).json({ error: 'Destination not found' });
      return;
    }
    if (existing.ownerId !== req.userId) {
      res.status(403).json({ error: 'Non sei il proprietario' });
      return;
    }
    const deleted = await deleteDestination(id);
    if (!deleted) {
      res.status(404).json({ error: 'Destination not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

module.exports = router;
