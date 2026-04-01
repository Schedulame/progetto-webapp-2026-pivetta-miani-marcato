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

async function getUserByCredentials(username, password) {
  try {
    const data = await readData();
    const users = data.users || [];
    return users.find((u) => u.username === username && u.password === password) || null;
  } catch (error) {
    throw error;
  }
}

module.exports = { readData, writeData, getAllDestinations, getUserByCredentials };
