import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Erro no parse' });

    const file = files.file;
    if (!file) return res.status(400).json({ error: 'Arquivo não enviado' });

    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.filepath), file.originalFilename || 'arquivo.pkpass');

    try {
      const response = await fetch('https://file.io/?expires=1d', {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders()
      });

      const result = await response.json();
      return res.status(response.status).json(result);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao enviar para o file.io' });
    }
  });
}
