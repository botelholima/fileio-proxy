export default async function handler(req, res) {
  // Libera CORS para todas as origens
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Trata requisição OPTIONS (pré-vôo do CORS)
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const response = await fetch("https://file.io/?expires=1d", {
      method: "POST",
      body: req.body,
      headers: {
        "Content-Type": req.headers["content-type"]
      }
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("Erro ao enviar para file.io:", err);
    return res.status(500).json({ error: "Erro ao enviar para file.io" });
  }
}
