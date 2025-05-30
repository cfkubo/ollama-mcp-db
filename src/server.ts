import express from "express";
import cors from "cors";
import OllamaMCPHost from "./index.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const host = new OllamaMCPHost();

app.post("/api/chat", async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Missing question" });
  }
  try {
    const answer = await host.processQuestion(question);
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(port, () => {
  console.log(`Web server running at http://localhost:${port}`);
});