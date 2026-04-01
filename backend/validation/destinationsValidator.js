function validateDestination(body) {
  const errors = [];
  const { nome, paese, costo_stimato, durata_giorni, visitato } = body;

  if (typeof nome !== 'string' || nome.trim().length < 2 || nome.trim().length > 100) {
    errors.push('nome non valido (2-100 caratteri)');
  }
  if (typeof paese !== 'string' || paese.trim().length < 2 || paese.trim().length > 60) {
    errors.push('paese non valido (2-60 caratteri)');
  }
  if (typeof costo_stimato !== 'number' || isNaN(costo_stimato) || costo_stimato < 0 || costo_stimato > 50000) {
    errors.push('costo_stimato non valido (0-50000)');
  }
  if (typeof durata_giorni !== 'number' || !Number.isInteger(durata_giorni) || durata_giorni < 1 || durata_giorni > 365) {
    errors.push('durata_giorni non valido (1-365)');
  }
  if (typeof visitato !== 'boolean') {
    errors.push('visitato deve essere booleano');
  }

  return errors;
}

module.exports = { validateDestination };
