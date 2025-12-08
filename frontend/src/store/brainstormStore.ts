import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Session, User, Idea, IdeaGroup, AgentMessage } from '@ai-brainstorm/shared';

interface BrainstormState {
  socket: Socket | null;
  isConnected: boolean;
  sessionId: string | null;
  currentUser: User | null;
  session: Session | null;
  agentMessages: AgentMessage[];

  // Actions
  connect: (sessionId: string, userName: string) => void;
  disconnect: () => void;
  addIdea: (content: string, position?: { x: number; y: number }) => void;
  updateIdea: (ideaId: string, updates: Partial<Idea>) => void;
  deleteIdea: (ideaId: string) => void;
  createGroup: (group: IdeaGroup) => void;
  updateGroup: (groupId: string, updates: Partial<IdeaGroup>) => void;
  deleteGroup: (groupId: string) => void;
  requestFacilitation: () => void;
}

export const useBrainstormStore = create<BrainstormState>((set, get) => ({
  socket: null,
  isConnected: false,
  sessionId: null,
  currentUser: null,
  session: null,
  agentMessages: [],

  connect: (sessionId: string, userName: string) => {
    const socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('join', { sessionId, userName });
      set({ isConnected: true, sessionId });
    });

    socket.on('session:state', (session: Session) => {
      console.log('Received session state:', session);
      set({ session });
    });

    socket.on('user:join', (user: User) => {
      const { session } = get();
      if (session) {
        set({
          session: {
            ...session,
            users: [...session.users, user]
          }
        });
      }
    });

    socket.on('user:leave', (user: User) => {
      const { session } = get();
      if (session) {
        set({
          session: {
            ...session,
            users: session.users.filter((u: User) => u.id !== user.id)
          }
        });
      }
    });

    socket.on('idea:add', (idea: Idea) => {
      const { session } = get();
      if (session) {
        set({
          session: {
            ...session,
            ideas: [...session.ideas, idea]
          }
        });
      }
    });

    socket.on('idea:update', ({ ideaId, updates }: { ideaId: string; updates: Partial<Idea> }) => {
      const { session } = get();
      if (session) {
        set({
          session: {
            ...session,
            ideas: session.ideas.map((idea: Idea) =>
              idea.id === ideaId ? { ...idea, ...updates } : idea
            )
          }
        });
      }
    });

    socket.on('idea:delete', ({ ideaId }: { ideaId: string }) => {
      const { session } = get();
      if (session) {
        set({
          session: {
            ...session,
            ideas: session.ideas.filter((idea: Idea) => idea.id !== ideaId)
          }
        });
      }
    });

    socket.on('group:create', (group: IdeaGroup) => {
      const { session } = get();
      if (session) {
        set({
          session: {
            ...session,
            groups: [...session.groups, group]
          }
        });
      }
    });

    socket.on('group:update', ({ groupId, updates }: { groupId: string; updates: Partial<IdeaGroup> }) => {
      const { session } = get();
      if (session) {
        set({
          session: {
            ...session,
            groups: session.groups.map((group: IdeaGroup) =>
              group.id === groupId ? { ...group, ...updates } : group
            )
          }
        });
      }
    });

    socket.on('group:delete', ({ groupId }: { groupId: string }) => {
      const { session } = get();
      if (session) {
        set({
          session: {
            ...session,
            groups: session.groups.filter((group: IdeaGroup) => group.id !== groupId)
          }
        });
      }
    });

    socket.on('agent:message', (message: AgentMessage) => {
      set(state => ({
        agentMessages: [...state.agentMessages, message]
      }));
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      set({ isConnected: false });
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, session: null });
    }
  },

  addIdea: (content: string, position?: { x: number; y: number }) => {
    const { socket } = get();
    if (socket) {
      socket.emit('idea:add', { content, position });
    }
  },

  updateIdea: (ideaId: string, updates: Partial<Idea>) => {
    const { socket } = get();
    if (socket) {
      socket.emit('idea:update', { ideaId, updates });
    }
  },

  deleteIdea: (ideaId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('idea:delete', { ideaId });
    }
  },

  createGroup: (group: IdeaGroup) => {
    const { socket } = get();
    if (socket) {
      socket.emit('group:create', group);
    }
  },

  updateGroup: (groupId: string, updates: Partial<IdeaGroup>) => {
    const { socket } = get();
    if (socket) {
      socket.emit('group:update', { groupId, updates });
    }
  },

  deleteGroup: (groupId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('group:delete', { groupId });
    }
  },

  requestFacilitation: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('request:facilitation');
    }
  }
}));
