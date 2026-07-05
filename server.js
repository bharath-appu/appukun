const express = require("express");
const path = require("path");
const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

const aspectSizes = {
  "1:1": { w: 1024, h: 1024 },
  "16:9": { w: 1280, h: 720 },
  "4:3": { w: 1024, h: 768 },
  "3:2": { w: 1024, h: 683 },
  "2.35:1": { w: 1175, h: 500 },
  "4:5": { w: 720, h: 900 },
  "2:3": { w: 683, h: 1024 },
  "9:16": { w: 720, h: 1280 },
};

const creativityModels = {
  raw: "flux-schnell",
  low: "flux-realism",
  medium: "flux-schnell",
  high: "flux-schnell",
};

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, aspect_ratio = "1:1", creativity = "medium" } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const size = aspectSizes[aspect_ratio] || aspectSizes["1:1"];
    const model = creativityModels[creativity] || "flux";

    const imageUrl =
      `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
      `?width=${size.w}&height=${size.h}&model=${model}&nologo=true&seed=${Math.floor(Math.random() * 999999)}`;

    const imgResp = await fetch(imageUrl);
    if (!imgResp.ok) throw new Error(`Pollinations returned HTTP ${imgResp.status}`);

    const buffer = Buffer.from(await imgResp.arrayBuffer());
    res.set("Content-Type", imgResp.headers.get("content-type") || "image/jpeg");
    res.set("Content-Length", buffer.length);
    res.end(buffer);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`appukunimg running at http://localhost:${PORT}`);
    console.log("Using Pollinations.ai | Flux model (free, no API key)");
  });
}

module.exports = app;
