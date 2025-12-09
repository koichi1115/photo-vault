import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { SessionManager } from './services/SessionManager';
import { setupSocketHandlers } from './socket/handlers';
import photoRoutes from './routes/photoRoutes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Photo storage routes
app.use('/api/photos', photoRoutes);

// Initialize session manager
const sessionManager = new SessionManager();

// Setup WebSocket handlers
setupSocketHandlers(io, sessionManager);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`📦 Glacier Photo Vault Server running on port ${PORT}`);
});
