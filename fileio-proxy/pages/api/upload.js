export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const fileData = req.body;

    const response = await fetch('https://file.io/?expires=1d', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      body: fileData
    });

    const result = await response.json();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar para file.io', details: err.message });
  }
}