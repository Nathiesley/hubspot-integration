
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const HUBSPOT_TOKEN = 'process.env.HUBSPOT_TOKEN;'; // Substitua pelo seu token

app.use(express.static(__dirname));

app.get('/api/contact', async (req, res) => {
  const name = req.query.name;
  if (!name) return res.json({ error: 'Nome não fornecido' });

  try {
    // Buscar contato por nome
    const searchResult = await axios.post('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      filterGroups: [{
        filters: [{ propertyName: 'firstname', operator: 'EQ', value: name }]
      }],
      properties: ['firstname', 'email', 'phone'],
      limit: 1
    }, {
      headers: {
        Authorization: `Bearer ${HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const results = searchResult.data.results;
    if (results.length > 0) {
      const contact = results[0];
      return res.json({
        id: contact.id,
        name: contact.properties.firstname,
        email: contact.properties.email,
        phone: contact.properties.phone
      });
    }

    // Criar contato se não existir
    const createResult = await axios.post('https://api.hubapi.com/crm/v3/objects/contacts', {
      properties: {
        firstname: name,
        email: 'joao@email.com',
        phone: '(11) 98765-4321'
      }
    }, {
      headers: {
        Authorization: `Bearer ${HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const contact = createResult.data;
    return res.json({
      id: contact.id,
      name: contact.properties.firstname,
      email: contact.properties.email,
      phone: contact.properties.phone
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.json({ error: 'Erro ao buscar ou criar contato' });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
