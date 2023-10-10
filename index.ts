import express from "express";
import { createDraft, draftPlayer, getDraft, joinDraft } from './routes';
import bodyParser from 'body-parser';

// Configure and start the HTTP server.
const port = 8088;
const app = express();
app.use(bodyParser.json());
app.post('/api/create', createDraft);
app.post('/api/draftPlayer', draftPlayer);
app.get('/api/getDraft', getDraft);
app.get('/api/join', joinDraft);
app.listen(port, () => console.log(`Server listening on ${port}`));