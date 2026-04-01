const fs = require('fs').promises;
const path = require('path');

const dataFilePath = path.join(__dirname, '../data.json');

async function readData() {
  try {
    const content = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw error;
  }
}

async function writeData(data) {
  try {
    const json = JSON.stringify(data, null, 2);
    await fs.writeFile(dataFilePath, json, 'utf-8');
  } catch (error) {
    throw error;
  }
}

async function getAllDestinations() {
  try {
    const data = await readData();
    return data.destinations || [];
  } catch (error) {
    throw error;
  }
}

async function getDestinationById(id) {
  try {
    const data = await readData();
    return (data.destinations || []).find((d) => d.id === id) || null;
  } catch (error) {
    throw error;
  }
}

async function createDestination(body, ownerId) {
  try {
    const data = await readData();
    const nextId = data.nextId || 1;
    const destination = {
      id: nextId,
      nome: body.nome,
      paese: body.paese,
      costo_stimato: body.costo_stimato,
      durata_giorni: body.durata_giorni,
      visitato: body.visitato,
      ownerId,
    };
    data.destinations = data.destinations || [];
    data.destinations.push(destination);
    data.nextId = nextId + 1;
    await writeData(data);
    return destination;
  } catch (error) {
    throw error;
  }
}

async function getUserByCredentials(username, password) {
  try {
    const data = await readData();
    const users = data.users || [];
    return users.find((u) => u.username === username && u.password === password) || null;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  readData, writeData, getAllDestinations, getDestinationById, createDestination, getUserByCredentials,
};
