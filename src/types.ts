export type PermissionStatus =
  | 'PENDING'
  | 'REQUESTING'
  | 'GRANTED'
  | 'DENIED'
  | 'PERMANENTLY_DENIED'
  | 'NOT_SUPPORTED';

export interface PermissionItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  required?: boolean;
  android_permissions: string[];
  status: PermissionStatus;
}

export interface AdvancedPermissionItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  action: string;
  status: PermissionStatus;
  android_intent?: string;
}

export type AssistantState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'error';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  toolCall?: {
    name: string;
    args: Record<string, any>;
    status?: 'executed' | 'permission_denied' | 'pending';
  };
  isCached?: boolean;
}

export interface MemoryItem {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  category: 'reminder' | 'note' | 'preference' | 'contact';
}

export interface SystemNotification {
  id: string;
  appName: string;
  appPackage: string;
  title: string;
  text: string;
  time: string;
  iconType: 'whatsapp' | 'call' | 'sms' | 'system';
  isRead: boolean;
}

export interface AndroidSystemDialogConfig {
  isOpen: boolean;
  type: 'battery' | 'overlay' | 'notification_access' | 'accessibility' | 'default_assistant' | 'app_info' | 'call_prompt';
  targetPermissionId?: string;
  metadata?: Record<string, any>;
}
