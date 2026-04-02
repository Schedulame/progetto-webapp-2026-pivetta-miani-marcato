const express = require('express');
const { getAllDestinations } = require('../data/destinationsStore');

const router = express.Router();

router.get('/destinations', async (req, res) => {
  try {
    const all = await getAllDestinations();
    res.status(200).json({ results: all, total: all.length });
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

module.exports = router;
