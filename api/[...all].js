import dotenv from "dotenv";
import express from "express";
import serverless from "serverless-http";

dotenv.config();

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "dev-token";

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

// Vercel routes /api/webhook to this file, so routes should be relative to root (/)
app.get("/", verify);
app.post("/", receive);
app.get("/api/health", (_req, res) => res.status(200).send("ok"));

// For local development, also add /api/webhook routes
if (!process.env.VERCEL) {
	app.get("/api/webhook", verify);
	app.post("/api/webhook", receive);
}

// Export serverless handler for Vercel
const handler = serverless(app);
export default handler;

// For local development, start the server
if (!process.env.VERCEL) {
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
		console.log(`Webhook endpoint: http://localhost:${PORT}/api/webhook`);
		console.log(`Health check: http://localhost:${PORT}/api/health`);
	});
}
