import dotenv from "dotenv";
import express from "express";
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

// 👇 Export the handler for serverless (Vercel)
export default serverless(app);

// 👇 For local development, start the server
// Check if we're not in a serverless environment (Vercel sets VERCEL env var)
if (!process.env.VERCEL) {
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
		console.log(`Webhook endpoint: http://localhost:${PORT}/api/webhook`);
	});
}
