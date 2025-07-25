import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Permitir requisições de qualquer origem (ou especifique sua extensão)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // responde pré-flight
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const form = new formidable.IncomingForm({
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      console.error("Erro no parse do form ou arquivo ausente:", err);
      return res.status(400).json({ error: 'Erro ao processar o arquivo' });
    }

    const filePath = files.file[0].filepath;

    try {
      const fileData = fs.readFileSync(filePath);

      const formData = new FormData();
      formData.append('file', new Blob([fileData]), files.file[0].originalFilename);

      const response = await fetch('https://file.io', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success && data.link) {
        return res.status(200).json({ link: data.link });
      } else {
        console.warn("Upload para file.io falhou:", data);
        return res.status(500).json({ error: 'Falha no upload', details: data });
      }
    } catch (error) {
      console.error("Erro durante upload:", error);
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  });
}
