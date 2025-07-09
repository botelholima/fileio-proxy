import formidable from 'formidable-serverless';

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
        console.error("Erro ao fazer parse do formulário:", err);
        return res.status(500).json({ error: "Erro ao processar o formulário" });
      }

      const file = files.file;
      const formData = new FormData();
      formData.append("file", file.filepath ? await fs.promises.readFile(file.filepath) : file, file.originalFilename || "cartao.pkpass");

      const response = await fetch("https://file.io/?expires=1d", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      return res.status(response.status).json(result);
    });
  } catch (error) {
    console.error("Erro no servidor proxy:", error);
    return res.status(500).json({ error: "Erro interno ao enviar o arquivo" });
  }
}
