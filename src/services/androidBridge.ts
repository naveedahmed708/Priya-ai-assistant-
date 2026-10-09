import { PriyaPermissionManager } from './permissionManager';
import { MemoryItem, SystemNotification } from '../types';

export interface DeviceContact {
  id: string;
  name: string;
  phone: string;
  avatarColor: string;
}

export const INITIAL_CONTACTS: DeviceContact[] = [
  { id: '1', name: 'Papa', phone: '+91 98765 43210', avatarColor: '#3b82f6' },
  { id: '2', name: 'Mummy', phone: '+91 98765 12345', avatarColor: '#ec4899' },
  { id: '3', name: 'Rahul Sharma', phone: '+91 98123 45678', avatarColor: '#10b981' },
  { id: '4', name: 'Ayesha Khan', phone: '+91 98987 65432', avatarColor: '#8b5cf6' },
  { id: '5', name: 'Office Manager', phone: '+91 99001 22334', avatarColor: '#f59e0b' },
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'n1',
    appName: 'WhatsApp',
    appPackage: 'com.whatsapp',
    title: 'Ayesha Khan',
    text: 'Hey! Are we meeting at 5 PM for the project discussion?',
    time: '2m ago',
    iconType: 'whatsapp',
    isRead: false,
  },
  {
    id: 'n2',
    appName: 'Phone',
    appPackage: 'com.google.android.dialer',
    title: 'Missed Call',
    text: 'Rahul Sharma called 10 minutes ago',
    time: '10m ago',
    iconType: 'call',
    isRead: false,
  },
  {
    id: 'n3',
    appName: 'Messages',
    appPackage: 'com.google.android.apps.messaging',
    title: 'State Bank Alert',
    text: 'OTP for online transaction is 849201. Valid for 10 mins.',
    time: '25m ago',
    iconType: 'sms',
    isRead: true,
  },
];

export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'm1',
    title: 'Dentist Appointment',
    content: 'Tomorrow at 10:30 AM with Dr. Verma',
    timestamp: Date.now() - 3600000 * 4,
    category: 'reminder',
  },
  {
    id: 'm2',
    title: 'Favorite Coffee',
    content: 'Oat milk caramel latte, extra warm',
    timestamp: Date.now() - 3600000 * 24,
    category: 'preference',
  },
  {
    id: 'm3',
    title: 'Flight Ticket',
    content: 'AI-302 departure gate B4 at 6:40 PM Friday',
    timestamp: Date.now() - 3600000 * 48,
    category: 'note',
  },
];

export class AndroidBridge {
  private static instance: AndroidBridge;
  private contacts: DeviceContact[] = [...INITIAL_CONTACTS];
  private notifications: SystemNotification[] = [...INITIAL_NOTIFICATIONS];
  private memories: MemoryItem[] = [...INITIAL_MEMORIES];
  private currentTrack: { title: string; artist: string; isPlaying: boolean } = {
    title: 'Kesariya (Lo-fi Chill)',
    artist: 'Priya Ambient Radio',
    isPlaying: false,
  };

  private constructor() {}

  public static getInstance(): AndroidBridge {
    if (!AndroidBridge.instance) {
      AndroidBridge.instance = new AndroidBridge();
    }
    return AndroidBridge.instance;
  }

  public getContacts(): DeviceContact[] {
    return this.contacts;
  }

  public getNotifications(): SystemNotification[] {
    return this.notifications;
  }

  public getMemories(): MemoryItem[] {
    return this.memories;
  }

  public addMemory(memory: Omit<MemoryItem, 'id' | 'timestamp'>): MemoryItem {
    const item: MemoryItem = {
      ...memory,
      id: 'm_' + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    this.memories.unshift(item);
    return item;
  }

  public getMusicState() {
    return this.currentTrack;
  }

  public toggleMusic(action?: 'play' | 'pause' | 'next') {
    if (action === 'play') this.currentTrack.isPlaying = true;
    else if (action === 'pause') this.currentTrack.isPlaying = false;
    else this.currentTrack.isPlaying = !this.currentTrack.isPlaying;
    return this.currentTrack;
  }

  // Execute tool call from Priya with permission safety checking
  public async executeTool(
    name: string,
    args: Record<string, any>,
    openDialogCallback: (type: any, meta?: any) => void
  ): Promise<{ success: boolean; result: string; requiresPermission?: string }> {
    const pm = PriyaPermissionManager.getInstance();

    switch (name) {
      case 'openWebsite': {
        const url = args.url?.startsWith('http') ? args.url : `https://${args.url}`;
        window.open(url, '_blank');
        return { success: true, result: `Opened website ${url}` };
      }

      case 'makePhoneCall': {
        const callPerm = pm.getPermission('phone_calls')?.status;
        if (callPerm !== 'GRANTED') {
          return {
            success: false,
            result: 'Phone calls permission is required before placing phone calls.',
            requiresPermission: 'phone_calls',
          };
        }
        const phone = args.phone_number || '+91 98765 43210';
        const contactName = args.contact_name || 'Contact';
        openDialogCallback('call_prompt', { phone, contactName });
        return {
          success: true,
          result: `Placing phone call to ${contactName} (${phone}) via Android dialer`,
        };
      }

      case 'findContact': {
        const contactPerm = pm.getPermission('contacts')?.status;
        if (contactPerm !== 'GRANTED') {
          return {
            success: false,
            result: 'Contacts permission is needed to look up numbers by name.',
            requiresPermission: 'contacts',
          };
        }
        const query = (args.name || '').toLowerCase();
        const found = this.contacts.find((c) => c.name.toLowerCase().includes(query));
        if (found) {
          return {
            success: true,
            result: `Found contact ${found.name}: ${found.phone}`,
          };
        }
        return { success: false, result: `No contact found matching "${args.name}".` };
      }

      case 'sendSMS': {
        const smsPerm = pm.getPermission('sms')?.status;
        if (smsPerm !== 'GRANTED') {
          return {
            success: false,
            result: 'SMS permission is required to prepare and send text messages.',
            requiresPermission: 'sms',
          };
        }
        const phone = args.phone_number || '';
        const msg = encodeURIComponent(args.message || '');
        // Trigger sms intent
        window.location.href = `sms:${phone}?body=${msg}`;
        return {
          success: true,
          result: `SMS prepared to ${phone}: "${args.message}"`,
        };
      }

      case 'getLocation': {
        const locPerm = pm.getPermission('location')?.status;
        if (locPerm !== 'GRANTED') {
          return {
            success: false,
            result: 'Location permission is not granted.',
            requiresPermission: 'location',
          };
        }
        return {
          success: true,
          result: `Current location: Mumbai, Maharashtra (19.0760° N, 72.8777° E)`,
        };
      }

      case 'openCamera': {
        const camPerm = pm.getPermission('camera')?.status;
        if (camPerm !== 'GRANTED') {
          return {
            success: false,
            result: 'Camera permission is not granted.',
            requiresPermission: 'camera',
          };
        }
        return {
          success: true,
          result: 'Camera viewfinder opened.',
        };
      }

      case 'openGallery': {
        const galleryPerm = pm.getPermission('gallery_files')?.status;
        if (galleryPerm !== 'GRANTED') {
          return {
            success: false,
            result: 'Gallery & files permission is required.',
            requiresPermission: 'gallery_files',
          };
        }
        return {
          success: true,
          result: 'Gallery media browser accessed.',
        };
      }

      case 'openApp': {
        const appName = args.app_name || 'App';
        return {
          success: true,
          result: `Launched Android application: ${appName}`,
        };
      }

      case 'controlMusic': {
        const action = args.action || 'play';
        this.toggleMusic(action as any);
        return {
          success: true,
          result: `Music ${action}ed: ${this.currentTrack.title}`,
        };
      }

      case 'getWeather': {
        return {
          success: true,
          result: 'Current weather: 31°C, Clear skies, 56% humidity, pleasant breeze.',
        };
      }

      case 'setReminder': {
        this.addMemory({
          title: args.reminder_text,
          content: args.time ? `Scheduled for: ${args.time}` : 'Scheduled for today',
          category: 'reminder',
        });
        return {
          success: true,
          result: `Reminder set: "${args.reminder_text}" for ${args.time || 'scheduled time'}.`,
        };
      }

      default:
        return { success: false, result: `Unsupported action: ${name}` };
    }
  }
}
