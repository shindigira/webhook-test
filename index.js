import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
app.use(express.json());

// Serve static files from public directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(join(__dirname, "public")));

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "dev-token";

// Handler functions
const verify = (req, res) => {
	const mode = req.query["hub.mode"];
	const token = req.query["hub.verify_token"];
	const challenge = req.query["hub.challenge"];
	if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
		return res.status(200).send(challenge);
	}
	return res.sendStatus(403);
};

const receive = (req, res) => {
	console.log("Webhook event:", JSON.stringify(req.body, null, 2));
	res.sendStatus(200);
};

// Register routes
app.get("/api/webhook", verify);
app.post("/api/webhook", receive);
app.get("/api/health", (_req, res) => res.status(200).send("ok"));

// Start server (Railway will provide PORT via environment variable)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	console.log(`Health check: http://localhost:${PORT}/api/health`);
	console.log(`Webhook endpoint: http://localhost:${PORT}/api/webhook`);
});
