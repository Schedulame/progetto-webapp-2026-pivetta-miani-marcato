const express = require('express');
const {
  getAllDestinations,
  getDestinationById,
} = require('../data/destinationsStore');

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

module.exports = router;
