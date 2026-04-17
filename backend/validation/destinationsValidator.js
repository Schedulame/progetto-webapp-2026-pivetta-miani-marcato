function validateDestination(body) {
  const errors = [];

  const { nome, paese, costo_stimato, durata_giorni, visitato } = body;

  if (typeof nome !== 'string' || nome.trim().length < 2 || nome.trim().length > 100) {
    errors.push('Il campo "nome" è obbligatorio e deve avere tra 2 e 100 caratteri.');
  }

  if (typeof paese !== 'string' || paese.trim().length < 2 || paese.trim().length > 60) {
    errors.push('Il campo "paese" è obbligatorio e deve avere tra 2 e 60 caratteri.');
  }

  if (typeof costo_stimato !== 'number' || Number.isNaN(costo_stimato) || costo_stimato < 0 || costo_stimato > 50000) {
    errors.push('Il campo "costo_stimato" è obbligatorio, numerico e deve essere tra 0 e 50000.');
  }

  if (
    typeof durata_giorni !== 'number' ||
    Number.isNaN(durata_giorni) ||
    !Number.isInteger(durata_giorni) ||
    durata_giorni < 1 ||
    durata_giorni > 365
  ) {
    errors.push('Il campo "durata_giorni" è obbligatorio, intero e deve essere tra 1 e 365.');
  }

  if (typeof visitato !== 'boolean') {
    errors.push('Il campo "visitato" è obbligatorio e deve essere booleano.');
  }

  return errors;
}

function validatePartialDestination(body) {
  const errors = [];

  const hasNome = Object.prototype.hasOwnProperty.call(body, 'nome');
  const hasPaese = Object.prototype.hasOwnProperty.call(body, 'paese');
  const hasCosto = Object.prototype.hasOwnProperty.call(body, 'costo_stimato');
  const hasDurata = Object.prototype.hasOwnProperty.call(body, 'durata_giorni');
  const hasVisitato = Object.prototype.hasOwnProperty.call(body, 'visitato');

  const anyFieldPresent = hasNome || hasPaese || hasCosto || hasDurata || hasVisitato;

  if (!anyFieldPresent) {
    return ['Nessun campo da aggiornare'];
  }

  if (hasNome) {
    const nome = body.nome;
    if (typeof nome !== 'string' || nome.trim().length < 2 || nome.trim().length > 100) {
      errors.push('Il campo "nome" deve avere tra 2 e 100 caratteri.');
    }
  }

  if (hasPaese) {
    const paese = body.paese;
    if (typeof paese !== 'string' || paese.trim().length < 2 || paese.trim().length > 60) {
      errors.push('Il campo "paese" deve avere tra 2 e 60 caratteri.');
    }
  }

  if (hasCosto) {
    const costo_stimato = body.costo_stimato;
    if (
      typeof costo_stimato !== 'number' ||
      Number.isNaN(costo_stimato) ||
      costo_stimato < 0 ||
      costo_stimato > 50000
    ) {
      errors.push('Il campo "costo_stimato" deve essere numerico e tra 0 e 50000.');
    }
  }

  if (hasDurata) {
    const durata_giorni = body.durata_giorni;
    if (
      typeof durata_giorni !== 'number' ||
      Number.isNaN(durata_giorni) ||
      !Number.isInteger(durata_giorni) ||
      durata_giorni < 1 ||
      durata_giorni > 365
    ) {
      errors.push('Il campo "durata_giorni" deve essere intero e tra 1 e 365.');
    }
  }

  if (hasVisitato) {
    const visitato = body.visitato;
    if (typeof visitato !== 'boolean') {
      errors.push('Il campo "visitato" deve essere booleano.');
    }
  }

  return errors;
}

module.exports = {
  validateDestination,
  validatePartialDestination,
};
