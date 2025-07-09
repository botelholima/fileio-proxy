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
    console.log("📥 Iniciando parser do formulário...");
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("❌ Erro ao processar formulário:", err);
        return res.status(500).json({ error: "Erro ao processar formulário" });
      }

      console.log("✅ Formulário processado com sucesso.");
      const file = files.file;

      if (!file) {
        console.warn("⚠️ Nenhum arquivo foi enviado.");
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      console.log("📄 Arquivo recebido:", file.originalFilename, file.filepath);

      const fileStream = fs.createReadStream(file.filepath);
      const formData = new FormData();
      formData.append("file", fileStream, {
        filename: file.originalFilename || "cartao.pkpass",
        contentType: file.mimetype || "application/vnd.apple.pkpass"
      });

      console.log("⬆️ Enviando para file.io...");

      const response = await fetch("https://file.io/?expires=1d", {
        method: "POST",
        body: formData,
        headers: formData.getHeaders()
      });

      const result = await response.json();
      console.log("📨 Resposta da API file.io:", result);

      return res.status(response.status).json(result);
    });
  } catch (err) {
    console.error("🔥 Erro inesperado:", err);
    return res.status(500).json({ error: "Erro interno no proxy" });
  }
}
