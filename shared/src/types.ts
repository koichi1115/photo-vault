/**
 * Shared types for AI Brainstorm Service
 */

export interface User {
  id: string;
  name: string;
  color: string;
}

export interface Idea {
  id: string;
  userId: string;
  content: string;
  timestamp: number;
  position?: { x: number; y: number };
  groupId?: string;
}

export interface IdeaGroup {
  id: string;
  name: string;
  ideas: string[]; // Idea IDs
  position?: { x: number; y: number };
  color: string;
}

export interface AgentMessage {
  id: string;
  userId: string;
  type: 'question' | 'suggestion' | 'feedback';
  content: string;
  timestamp: number;
  relatedIdeaIds?: string[];
}

export interface Session {
  id: string;
  name: string;
  users: User[];
  ideas: Idea[];
  groups: IdeaGroup[];
  createdAt: number;
}

export enum MessageType {
  // User actions
  USER_JOIN = 'user:join',
  USER_LEAVE = 'user:leave',

  // Idea operations
  IDEA_ADD = 'idea:add',
  IDEA_UPDATE = 'idea:update',
  IDEA_DELETE = 'idea:delete',

  // Group operations
  GROUP_CREATE = 'group:create',
  GROUP_UPDATE = 'group:update',
  GROUP_DELETE = 'group:delete',

  // Agent messages
  AGENT_MESSAGE = 'agent:message',
  AGENT_VOICE_START = 'agent:voice:start',
  AGENT_VOICE_END = 'agent:voice:end',

  // Session sync
  SESSION_STATE = 'session:state',
  SESSION_UPDATE = 'session:update'
}

export interface WebSocketMessage {
  type: MessageType;
  payload: any;
  timestamp: number;
  userId?: string;
}

/**
 * Photo storage types for Glacier Deep Archive service
 */

export enum PhotoStatus {
  UPLOADING = 'uploading',
  ARCHIVED = 'archived',
  RESTORE_REQUESTED = 'restore_requested',
  RESTORING = 'restoring',
  RESTORED = 'restored',
  FAILED = 'failed'
}

export interface Photo {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  title?: string;
  description?: string;
  tags: string[];
  s3Key: string;
  glacierArchiveId?: string;
  status: PhotoStatus;
  uploadedAt: number;
  restoredUntil?: number; // Timestamp when the restored copy expires
  thumbnailUrl?: string;
}

export interface RestoreRequest {
  photoId: string;
  tier: 'Standard' | 'Bulk'; // Glacier restore tiers
  requestedAt: number;
  estimatedCompletionTime?: number;
}
