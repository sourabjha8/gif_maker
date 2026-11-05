import express from 'express';

const app = express();
const PORT = process.env.PORT || 4000;

const api = express.Router();

api.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Public traffic reaches this service at /api/* (see root vercel.json).
// Also mounted at / so direct local access (http://localhost:4000/health) keeps working.
app.use('/api', api);
app.use('/', api);

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

export default app;
