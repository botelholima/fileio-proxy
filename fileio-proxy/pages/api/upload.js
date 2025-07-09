export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
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

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Erro no proxy:", err);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao enviar para file.io" });
  }
}
