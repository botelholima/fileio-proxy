import formidable from 'formidable-serverless';
import fs from 'fs';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("❌ Erro ao processar formulário:", err);
        return res.status(500).json({ error: "Erro ao processar formulário" });
      }

      const file = files.file;
      if (!file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      const fileData = fs.createReadStream(file.filepath);
      const formData = new FormData();
      formData.append("file", fileData, file.originalFilename || "cartao.pkpass");

      const response = await fetch("https://file.io/?expires=1d", {
        method: "POST",
        body: formData,
        headers: formData.getHeaders()
      });

      const result = await response.json();
      res.status(response.status).json(result);
    });
  } catch (err) {
    console.error("🔥 Erro inesperado:", err);
    res.status(500).json({ error: "Erro interno no proxy" });
  }
}
