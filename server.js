const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.options('*', cors());
app.use(express.json());

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

app.post('/crear-pago', async (req, res) => {
  try {
    console.log('Creando preferencia:', JSON.stringify(req.body));
    
    const { items, nombre, email } = req.body;

    const preference = {
      items: items,
      payer: { name: nombre, email: email },
      back_urls: {
        success: 'https://criticshop2000.netlify.app/?pago=exitoso',
        failure: 'https://criticshop2000.netlify.app/?pago=fallido',
        pending: 'https://criticshop2000.netlify.app/?pago=pendiente'
      },
      auto_return: 'approved',
      statement_descriptor: 'CRITIC SHOP 2000'
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    });

    const data = await response.json();
    console.log('Respuesta MP:', JSON.stringify(data));

    if (data.init_point) {
      res.json({ init_point: data.init_point });
    } else {
      res.status(500).json({ error: 'No se pudo crear la preferencia', data });
    }

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('Critic Shop 2000 - Server OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
