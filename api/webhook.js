import express from "express";
import dotenv from "dotenv";
import serverless from "serverless-http";

dotenv.config();

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "dev-token";

app.get("/api/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

app.post("/api/webhook", (req, res) => {
  console.log("Webhook event:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// 👇 Export the handler instead of listening on a port
export default serverless(app);
