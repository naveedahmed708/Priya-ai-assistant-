import { PermissionItem, AdvancedPermissionItem, PermissionStatus } from '../types';

const STORAGE_KEY_PERMISSIONS = 'priya_permissions_v1';
const STORAGE_KEY_ADVANCED = 'priya_advanced_permissions_v1';

export const INITIAL_STEP2_PERMISSIONS: PermissionItem[] = [
  {
    id: 'microphone',
    title: 'Microphone',
    description: 'So you can talk to Priya. Required.',
    icon: 'mic',
    required: true,
    android_permissions: ['android.permission.RECORD_AUDIO'],
    status: 'PENDING',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: "Priya's own notification, which keeps her running in the background.",
    icon: 'bell',
    android_permissions: ['android.permission.POST_NOTIFICATIONS'],
    status: 'PENDING',
  },
  {
    id: 'camera',
    title: 'Camera',
    description: 'So she can take a photo or look at what you point the phone at.',
    icon: 'camera',
    android_permissions: ['android.permission.CAMERA'],
    status: 'PENDING',
  },
  {
    id: 'phone_calls',
    title: 'Phone calls',
    description: 'So she can place a call for you.',
    icon: 'phone',
    android_permissions: ['android.permission.CALL_PHONE'],
    status: 'PENDING',
  },
  {
    id: 'contacts',
    title: 'Contacts',
    description: 'So a name is enough — she looks up the number.',
    icon: 'contacts',
    android_permissions: ['android.permission.READ_CONTACTS'],
    status: 'PENDING',
  },
  {
    id: 'sms',
    title: 'SMS',
    description: 'So she can send a text message.',
    icon: 'message',
    android_permissions: ['android.permission.SEND_SMS'],
    status: 'PENDING',
  },
  {
    id: 'location',
    title: 'Location',
    description: 'Weather, navigation, and where you are.',
    icon: 'map-pin',
    android_permissions: [
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
    ],
    status: 'PENDING',
  },
  {
    id: 'gallery_files',
    title: 'Gallery & files',
    description: 'So she can find a photo or file and send it.',
    icon: 'image',
    android_permissions: [
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
    ],
    status: 'PENDING',
  },
  {
    id: 'call_management',
    title: 'Answer & manage calls',
    description: 'So she can announce who is calling and answer or reject it.',
    icon: 'headphones',
    android_permissions: [
      'android.permission.READ_PHONE_STATE',
      'android.permission.ANSWER_PHONE_CALLS',
    ],
    status: 'PENDING',
  },
  {
    id: 'bluetooth',
    title: 'Bluetooth',
    description: 'So her voice plays on your earbuds or speaker.',
    icon: 'bluetooth',
    android_permissions: [
      'android.permission.BLUETOOTH_CONNECT',
      'android.permission.BLUETOOTH_SCAN',
    ],
    status: 'PENDING',
  },
];

export const INITIAL_STEP3_PERMISSIONS: AdvancedPermissionItem[] = [
  {
    id: 'battery',
    title: 'Battery — no optimisation',
    description: 'Required. Without it the phone kills Priya in the background and she goes quiet. Tap, then choose Allow.',
    required: true,
    action: 'Open official Android battery optimization settings',
    android_intent: 'android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
    status: 'PENDING',
  },
  {
    id: 'overlay',
    title: 'Display over other apps',
    description: 'So her orb can float on top of whatever you are doing.',
    required: false,
    action: 'Open ACTION_MANAGE_OVERLAY_PERMISSION',
    android_intent: 'android.settings.action.MANAGE_OVERLAY_PERMISSION',
    status: 'PENDING',
  },
  {
    id: 'notification_access',
    title: 'Notification access',
    description: 'To read WhatsApp messages and know who is calling. Turn on "Priya" in the list.',
    required: false,
    action: 'Open ACTION_NOTIFICATION_LISTENER_SETTINGS',
    android_intent: 'android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS',
    status: 'PENDING',
  },
  {
    id: 'accessibility',
    title: 'Accessibility service',
    description: 'So she can open apps, tap, and read the screen for you. Turn on "Priya" in the list.',
    required: false,
    action: 'Open ACTION_ACCESSIBILITY_SETTINGS',
    android_intent: 'android.settings.ACCESSIBILITY_SETTINGS',
    status: 'PENDING',
  },
  {
    id: 'default_assistant',
    title: 'Default assistant',
    description: 'Long-press the power button or swipe from a corner to call her, even on the lock screen. Pick "PRIYA".',
    required: false,
    action: 'Use Android RoleManager ROLE_ASSISTANT',
    android_intent: 'android.app.role.RoleManager.ROLE_ASSISTANT',
    status: 'PENDING',
  },
];

export class PriyaPermissionManager {
  private static instance: PriyaPermissionManager;
  private permissions: Map<string, PermissionItem> = new Map();
  private advancedPermissions: Map<string, AdvancedPermissionItem> = new Map();

  private constructor() {
    this.loadState();
  }

  public static getInstance(): PriyaPermissionManager {
    if (!PriyaPermissionManager.instance) {
      PriyaPermissionManager.instance = new PriyaPermissionManager();
    }
    return PriyaPermissionManager.instance;
  }

  private loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PERMISSIONS);
      if (stored) {
        const parsed: PermissionItem[] = JSON.parse(stored);
        parsed.forEach((p) => this.permissions.set(p.id, p));
      } else {
        INITIAL_STEP2_PERMISSIONS.forEach((p) => this.permissions.set(p.id, { ...p }));
      }

      const advStored = localStorage.getItem(STORAGE_KEY_ADVANCED);
      if (advStored) {
        const advParsed: AdvancedPermissionItem[] = JSON.parse(advStored);
        advParsed.forEach((p) => this.advancedPermissions.set(p.id, p));
      } else {
        INITIAL_STEP3_PERMISSIONS.forEach((p) =>
          this.advancedPermissions.set(p.id, { ...p })
        );
      }
    } catch {
      INITIAL_STEP2_PERMISSIONS.forEach((p) => this.permissions.set(p.id, { ...p }));
      INITIAL_STEP3_PERMISSIONS.forEach((p) =>
        this.advancedPermissions.set(p.id, { ...p })
      );
    }
  }

  private persistState() {
    try {
      localStorage.setItem(
        STORAGE_KEY_PERMISSIONS,
        JSON.stringify(Array.from(this.permissions.values()))
      );
      localStorage.setItem(
        STORAGE_KEY_ADVANCED,
        JSON.stringify(Array.from(this.advancedPermissions.values()))
      );
    } catch (e) {
      console.warn('Failed to persist permission state:', e);
    }
  }

  public getPermissions(): PermissionItem[] {
    return Array.from(this.permissions.values());
  }

  public getAdvancedPermissions(): AdvancedPermissionItem[] {
    return Array.from(this.advancedPermissions.values());
  }

  public getPermission(id: string): PermissionItem | undefined {
    return this.permissions.get(id);
  }

  public getAdvancedPermission(id: string): AdvancedPermissionItem | undefined {
    return this.advancedPermissions.get(id);
  }

  public updateStatus(id: string, status: PermissionStatus) {
    const item = this.permissions.get(id);
    if (item) {
      item.status = status;
      this.permissions.set(id, item);
      this.persistState();
    }
  }

  public updateAdvancedStatus(id: string, status: PermissionStatus) {
    const item = this.advancedPermissions.get(id);
    if (item) {
      item.status = status;
      this.advancedPermissions.set(id, item);
      this.persistState();
    }
  }

  // Real permission check against actual browser/hardware APIs
  public async verifyRealBrowserPermissions(): Promise<void> {
    // 1. Check microphone
    if (navigator.mediaDevices) {
      try {
        if ('permissions' in navigator) {
          const micStatus = await navigator.permissions.query({ name: 'microphone' as any });
          if (micStatus.state === 'granted') {
            this.updateStatus('microphone', 'GRANTED');
          } else if (micStatus.state === 'denied') {
            this.updateStatus('microphone', 'DENIED');
          }
        }
      } catch {
        // Permissions query not supported for mic
      }
    }

    // 2. Check notifications
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        this.updateStatus('notifications', 'GRANTED');
      } else if (Notification.permission === 'denied') {
        this.updateStatus('notifications', 'DENIED');
      }
    }

    // 3. Check geolocation
    if ('geolocation' in navigator && 'permissions' in navigator) {
      try {
        const geoStatus = await navigator.permissions.query({ name: 'geolocation' as any });
        if (geoStatus.state === 'granted') {
          this.updateStatus('location', 'GRANTED');
        } else if (geoStatus.state === 'denied') {
          this.updateStatus('location', 'DENIED');
        }
      } catch {
        // Ignored
      }
    }

    // 4. Check camera
    if ('permissions' in navigator) {
      try {
        const camStatus = await navigator.permissions.query({ name: 'camera' as any });
        if (camStatus.state === 'granted') {
          this.updateStatus('camera', 'GRANTED');
        } else if (camStatus.state === 'denied') {
          this.updateStatus('camera', 'DENIED');
        }
      } catch {
        // Ignored
      }
    }
  }

  // Request actual microphone with hardware stream
  public async requestMicrophone(): Promise<boolean> {
    this.updateStatus('microphone', 'REQUESTING');
    try {
      if (!navigator.mediaDevices) {
        throw new Error('Microphone not supported');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop initial stream tracks
      stream.getTracks().forEach((track) => track.stop());
      this.updateStatus('microphone', 'GRANTED');
      return true;
    } catch (err: any) {
      console.warn('Microphone permission request result:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.updateStatus('microphone', 'DENIED');
      } else {
        this.updateStatus('microphone', 'DENIED');
      }
      return false;
    }
  }

  // Request notifications
  public async requestNotifications(): Promise<boolean> {
    this.updateStatus('notifications', 'REQUESTING');
    try {
      if (!('Notification' in window)) {
        this.updateStatus('notifications', 'NOT_SUPPORTED');
        return false;
      }
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        this.updateStatus('notifications', 'GRANTED');
        return true;
      } else {
        this.updateStatus('notifications', 'DENIED');
        return false;
      }
    } catch {
      this.updateStatus('notifications', 'DENIED');
      return false;
    }
  }

  // Request camera
  public async requestCamera(): Promise<boolean> {
    this.updateStatus('camera', 'REQUESTING');
    try {
      if (!navigator.mediaDevices) {
        this.updateStatus('camera', 'NOT_SUPPORTED');
        return false;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      this.updateStatus('camera', 'GRANTED');
      return true;
    } catch {
      this.updateStatus('camera', 'DENIED');
      return false;
    }
  }

  // Request location
  public async requestLocation(): Promise<boolean> {
    this.updateStatus('location', 'REQUESTING');
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        this.updateStatus('location', 'NOT_SUPPORTED');
        resolve(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        () => {
          this.updateStatus('location', 'GRANTED');
          resolve(true);
        },
        () => {
          this.updateStatus('location', 'DENIED');
          resolve(false);
        },
        { timeout: 8000 }
      );
    });
  }

  // Check whether Microphone (mandatory requirement for Step 2) is granted
  public isMicrophoneGranted(): boolean {
    return this.permissions.get('microphone')?.status === 'GRANTED';
  }

  // Check whether Battery optimization (mandatory requirement for Step 3) is granted
  public isBatteryGranted(): boolean {
    return this.advancedPermissions.get('battery')?.status === 'GRANTED';
  }
}
