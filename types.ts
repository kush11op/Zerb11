
export interface FileNode {
  name: string;
  content: string;
  language: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  id: string;
  updatedFiles?: string[];
}

export interface ProjectState {
  files: FileNode[];
  activeFileName: string | null;
  logs: string[];
}

export enum WorkspaceTab {
  CODE = 'CODE',
  PREVIEW = 'PREVIEW',
  CONSOLE = 'CONSOLE'
}
