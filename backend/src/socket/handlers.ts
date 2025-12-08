import { Server, Socket } from 'socket.io';
import { SessionManager } from '../services/SessionManager';
import { MessageType, WebSocketMessage, User, Idea, IdeaGroup } from '@ai-brainstorm/shared';
import { v4 as uuidv4 } from 'uuid';
import { AIAgentService } from '../services/AIAgentService';

export function setupSocketHandlers(io: Server, sessionManager: SessionManager) {
  const aiService = new AIAgentService();

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    let currentUser: User | null = null;
    let currentSessionId: string | null = null;

    // User joins a session
    socket.on('join', (data: { sessionId: string; userName: string }) => {
      const { sessionId, userName } = data;

      // Create session if it doesn't exist
      let session = sessionManager.getSession(sessionId);
      if (!session) {
        session = sessionManager.createSession(`Brainstorm Session ${sessionId.substring(0, 8)}`);
      }

      // Create user
      const user: User = {
        id: socket.id,
        name: userName,
        color: getRandomColor()
      };

      currentUser = user;
      currentSessionId = sessionId;

      // Add user to session
      sessionManager.addUser(sessionId, user);

      // Join socket room
      socket.join(sessionId);

      // Send current session state to the new user
      socket.emit('session:state', session);

      // Notify others
      socket.to(sessionId).emit('user:join', user);

      console.log(`User ${userName} joined session ${sessionId}`);
    });

    // Add new idea
    socket.on('idea:add', async (data: { content: string; position?: { x: number; y: number } }) => {
      if (!currentUser || !currentSessionId) return;

      const idea: Idea = {
        id: uuidv4(),
        userId: currentUser.id,
        content: data.content,
        timestamp: Date.now(),
        position: data.position
      };

      sessionManager.addIdea(currentSessionId, idea);

      // Broadcast to all users in the session
      io.to(currentSessionId).emit('idea:add', idea);

      // Trigger AI analysis and suggestions
      const session = sessionManager.getSession(currentSessionId);
      if (session) {
        aiService.analyzeAndSuggest(session, idea).then(agentMessage => {
          if (agentMessage) {
            io.to(currentSessionId!).emit('agent:message', agentMessage);
          }
        });
      }
    });

    // Update idea
    socket.on('idea:update', (data: { ideaId: string; updates: Partial<Idea> }) => {
      if (!currentSessionId) return;

      sessionManager.updateIdea(currentSessionId, data.ideaId, data.updates);
      io.to(currentSessionId).emit('idea:update', data);
    });

    // Delete idea
    socket.on('idea:delete', (data: { ideaId: string }) => {
      if (!currentSessionId) return;

      sessionManager.deleteIdea(currentSessionId, data.ideaId);
      io.to(currentSessionId).emit('idea:delete', data);
    });

    // Create group
    socket.on('group:create', (data: IdeaGroup) => {
      if (!currentSessionId) return;

      sessionManager.createGroup(currentSessionId, data);
      io.to(currentSessionId).emit('group:create', data);
    });

    // Update group
    socket.on('group:update', (data: { groupId: string; updates: Partial<IdeaGroup> }) => {
      if (!currentSessionId) return;

      sessionManager.updateGroup(currentSessionId, data.groupId, data.updates);
      io.to(currentSessionId).emit('group:update', data);
    });

    // Delete group
    socket.on('group:delete', (data: { groupId: string }) => {
      if (!currentSessionId) return;

      sessionManager.deleteGroup(currentSessionId, data.groupId);
      io.to(currentSessionId).emit('group:delete', data);
    });

    // Voice conversation start
    socket.on('voice:start', () => {
      if (!currentSessionId || !currentUser) return;
      socket.to(currentSessionId).emit('agent:voice:start', { userId: currentUser.id });
    });

    // Voice conversation end
    socket.on('voice:end', () => {
      if (!currentSessionId || !currentUser) return;
      socket.to(currentSessionId).emit('agent:voice:end', { userId: currentUser.id });
    });

    // Request AI facilitation
    socket.on('request:facilitation', async () => {
      if (!currentSessionId) return;

      const session = sessionManager.getSession(currentSessionId);
      if (session) {
        const facilitation = await aiService.provideFacilitation(session);
        if (facilitation) {
          io.to(currentSessionId).emit('agent:message', facilitation);
        }
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (currentUser && currentSessionId) {
        sessionManager.removeUser(currentSessionId, currentUser.id);
        socket.to(currentSessionId).emit('user:leave', currentUser);
        console.log(`User ${currentUser.name} left session ${currentSessionId}`);
      }
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

function getRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B88B', '#A2D9CE'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
