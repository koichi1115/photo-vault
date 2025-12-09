import { Session, User, Idea, IdeaGroup } from '@glacier-photo-vault/shared';
import { v4 as uuidv4 } from 'uuid';

export class SessionManager {
  private sessions: Map<string, Session> = new Map();

  createSession(name: string): Session {
    const session: Session = {
      id: uuidv4(),
      name,
      users: [],
      ideas: [],
      groups: [],
      createdAt: Date.now()
    };
    this.sessions.set(session.id, session);
    return session;
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  addUser(sessionId: string, user: User): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    // Check if user already exists
    if (session.users.find(u => u.id === user.id)) {
      return true;
    }

    session.users.push(user);
    return true;
  }

  removeUser(sessionId: string, userId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.users = session.users.filter(u => u.id !== userId);
    return true;
  }

  addIdea(sessionId: string, idea: Idea): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.ideas.push(idea);
    return true;
  }

  updateIdea(sessionId: string, ideaId: string, updates: Partial<Idea>): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const ideaIndex = session.ideas.findIndex(i => i.id === ideaId);
    if (ideaIndex === -1) return false;

    session.ideas[ideaIndex] = { ...session.ideas[ideaIndex], ...updates };
    return true;
  }

  deleteIdea(sessionId: string, ideaId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.ideas = session.ideas.filter(i => i.id !== ideaId);

    // Remove from groups
    session.groups.forEach(group => {
      group.ideas = group.ideas.filter(id => id !== ideaId);
    });

    return true;
  }

  createGroup(sessionId: string, group: IdeaGroup): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.groups.push(group);
    return true;
  }

  updateGroup(sessionId: string, groupId: string, updates: Partial<IdeaGroup>): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const groupIndex = session.groups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) return false;

    session.groups[groupIndex] = { ...session.groups[groupIndex], ...updates };
    return true;
  }

  deleteGroup(sessionId: string, groupId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.groups = session.groups.filter(g => g.id !== groupId);
    return true;
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }
}
