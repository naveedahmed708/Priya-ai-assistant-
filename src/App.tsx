/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { PriyaPermissionManager } from './services/permissionManager';
import { audioEngineInstance, VisualizerData } from './services/audioEngine';
import { AndroidBridge } from './services/androidBridge';
import {
  AssistantState,
  ChatMessage,
  AndroidSystemDialogConfig,
  PermissionItem,
  AdvancedPermissionItem,
} from './types';

// Setup Flow Components
import { Step1Welcome } from './components/setup/Step1Welcome';
import { Step2Permissions } from './components/setup/Step2Permissions';
import { Step3Background } from './components/setup/Step3Background';

// Main Home Screen Components
import { TopBar } from './components/home/TopBar';
import { SubscriptionBanner } from './components/home/SubscriptionBanner';
import { GreetingHeader } from './components/home/GreetingHeader';
import { PriyaCoreVisualizer } from './components/home/PriyaCoreVisualizer';
import { QuickActionPills } from './components/home/QuickActionPills';
import { InformationCards } from './components/home/InformationCards';
import { ChatInputBar } from './components/home/ChatInputBar';
import { BottomNavigation } from './components/home/BottomNavigation';

// Modals and Drawers
import { AndroidSettingsModal } from './components/modals/AndroidSettingsModal';
import { ScanViewfinderModal } from './components/modals/ScanViewfinderModal';
import { MemoriesModal } from './components/modals/MemoriesModal';
import { ChatHistoryModal } from './components/modals/ChatHistoryModal';
import { SideDrawer } from './components/modals/SideDrawer';
import { NotificationShadeModal } from './components/modals/NotificationShadeModal';
import { FloatingOrb } from './components/modals/FloatingOrb';
import { CallPromptModal } from './components/modals/CallPromptModal';
import { MusicPlayerWidget } from './components/modals/MusicPlayerWidget';
import { EnergyEfficiencyModal } from './components/modals/EnergyEfficiencyModal';
import { WeatherDetailModal } from './components/modals/WeatherDetailModal';
import { cacheManager } from './services/cacheManager';
import { WifiOff, Database } from 'lucide-react';

export default function App() {
  const pm = PriyaPermissionManager.getInstance();
  const bridge = AndroidBridge.getInstance();

  // Setup Stepper State
  const [setupStep, setSetupStep] = useState<number>(() => {
    const isCompleted = localStorage.getItem('priya_setup_completed_v1');
    if (isCompleted === 'true') return 4; // 4 means Setup complete -> Home Screen
    const savedStep = localStorage.getItem('priya_current_step_v1');
    return savedStep ? parseInt(savedStep, 10) : 1;
  });

  // Permissions state
  const [permissions, setPermissions] = useState<PermissionItem[]>(pm.getPermissions());
  const [advancedPermissions, setAdvancedPermissions] = useState<AdvancedPermissionItem[]>(
    pm.getAdvancedPermissions()
  );

  // Assistant State
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [audioVolume, setAudioVolume] = useState<number>(0.12);
  const [frequencies, setFrequencies] = useState<number[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem('priya_chat_messages_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Network Offline State
  const [isOffline, setIsOffline] = useState<boolean>(() => cacheManager.isNetworkOffline());

  // Navigation & Modals
  const [currentTab, setCurrentTab] = useState<'home' | 'scan' | 'memories' | 'chat'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isMemoriesOpen, setIsMemoriesOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMusicWidgetOpen, setIsMusicWidgetOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isEnergyDashboardOpen, setIsEnergyDashboardOpen] = useState(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);

  // Settings & System Dialogs
  const [systemDialogConfig, setSystemDialogConfig] = useState<AndroidSystemDialogConfig>({
    isOpen: false,
    type: 'battery',
  });
  const [callModalConfig, setCallModalConfig] = useState<{
    isOpen: boolean;
    contactName: string;
    phone: string;
  }>({
    isOpen: false,
    contactName: '',
    phone: '',
  });

  // Feature Toggles
  const [floatingOrbEnabled, setFloatingOrbEnabled] = useState(() => {
    return pm.getAdvancedPermission('overlay')?.status === 'GRANTED';
  });
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);

  // User Profile
  const userName = 'Naveed Ahmed';

  // Synchronize permissions and check real browser hardware status
  const refreshPermissions = () => {
    setPermissions([...pm.getPermissions()]);
    setAdvancedPermissions([...pm.getAdvancedPermissions()]);
    setFloatingOrbEnabled(pm.getAdvancedPermission('overlay')?.status === 'GRANTED');
  };

  useEffect(() => {
    pm.verifyRealBrowserPermissions().then(refreshPermissions);

    // Re-check permissions and network state when user resumes application
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        pm.verifyRealBrowserPermissions().then(refreshPermissions);
        setIsOffline(cacheManager.isNetworkOffline());
      }
    };
    const handleOnline = () => setIsOffline(cacheManager.isNetworkOffline());
    const handleOffline = () => setIsOffline(true);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Configure Audio Engine Callbacks
  useEffect(() => {
    audioEngineInstance.setCallbacks({
      onWakeWord: () => {
        if (!wakeWordEnabled) return;
        console.log('Wake word "Hey Priya" detected');
        handleWakeWordTrigger();
      },
      onTranscript: (transcript: string) => {
        handleUserSpeechInput(transcript);
      },
      onVisualizer: (data: VisualizerData) => {
        setAudioVolume(data.volume);
        setFrequencies(data.frequencies);
      },
    });
  }, [wakeWordEnabled]);

  // Stepper navigation handlers
  const handleStep1Continue = () => {
    setSetupStep(2);
    localStorage.setItem('priya_current_step_v1', '2');
  };

  const handleStep2Continue = () => {
    setSetupStep(3);
    localStorage.setItem('priya_current_step_v1', '3');
  };

  const handleStep3Finish = () => {
    setSetupStep(4);
    localStorage.setItem('priya_setup_completed_v1', 'true');
    localStorage.setItem('priya_current_step_v1', '4');

    // Welcome voice from Priya
    setTimeout(() => {
      triggerPriyaSpeech(
        'Namaste Naveed! Priya is ready to help you. Ask me anything, or say "Hey Priya".'
      );
    }, 600);
  };

  // Open real Android system settings dialogs
  const handleOpenSystemScreen = (permId: string) => {
    setSystemDialogConfig({
      isOpen: true,
      type: permId as any,
    });
  };

  const handleOpenAppInfoScreen = (permId: string) => {
    setSystemDialogConfig({
      isOpen: true,
      type: 'app_info',
      targetPermissionId: permId,
    });
  };

  // Voice activation & user interaction
  const handleWakeWordTrigger = () => {
    if (assistantState === 'idle') {
      setAssistantState('listening');
      audioEngineInstance.startMicrophone();
      triggerPriyaSpeech('Haanji Naveed, boliye!');
    }
  };

  const handleToggleVoice = async () => {
    if (assistantState === 'listening' || assistantState === 'speaking') {
      // Stop session
      audioEngineInstance.stopMicrophone();
      audioEngineInstance.stopPlayback();
      setAssistantState('idle');
    } else {
      // Start listening
      setAssistantState('listening');
      const micGranted = await audioEngineInstance.startMicrophone();
      if (!micGranted) {
        setAssistantState('error');
        setErrorMessage('Microphone access is required. Please grant microphone permission.');
        setTimeout(() => setErrorMessage(null), 4000);
      }
    }
  };

  // Send message or transcribed user speech to Priya
  const handleUserSpeechInput = async (userInputText: string) => {
    if (!userInputText.trim()) return;

    // Add user message to conversation history
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      text: userInputText,
      timestamp: Date.now(),
    };

    const currentHistory = [...messages, userMsg];
    setMessages(currentHistory);
    try {
      localStorage.setItem('priya_chat_messages_v1', JSON.stringify(currentHistory));
    } catch {}

    setAssistantState('thinking');

    // 1. Check if network is offline or simulated offline
    const isOfflineNow = cacheManager.isNetworkOffline();

    if (isOfflineNow) {
      console.log('Serving voice query via offline cache...');
      const cached = cacheManager.getCachedResponse(userInputText);

      let assistantText = '';
      let executedTool: any = null;

      if (cached) {
        assistantText = cached.response;
        // If query was about device tools, trigger local action
        const qLower = userInputText.toLowerCase();
        if (qLower.includes('camera') || qLower.includes('scan') || qLower.includes('photo')) {
          setIsScanOpen(true);
          executedTool = { name: 'openCamera', args: {}, status: 'executed' };
        } else if (qLower.includes('music') || qLower.includes('gaana') || qLower.includes('song')) {
          const res = bridge.toggleMusic();
          setIsMusicPlaying(res.isPlaying);
          setIsMusicWidgetOpen(true);
          executedTool = { name: 'controlMusic', args: { action: 'toggle' }, status: 'executed' };
        }
      } else {
        assistantText =
          'Network abhi offline hai aur is sawal ka cache saved nahi hai. Aap cached weather data, schedule reminders, ya camera aur music controls use kar sakte hain.';
      }

      const assistantMsg: ChatMessage = {
        id: 'ast_cached_' + Date.now(),
        role: 'assistant',
        text: assistantText,
        timestamp: Date.now(),
        isCached: true,
        toolCall: executedTool,
      };

      const nextMessages = [...currentHistory, assistantMsg];
      setMessages(nextMessages);
      try {
        localStorage.setItem('priya_chat_messages_v1', JSON.stringify(nextMessages));
      } catch {}

      setAssistantState('speaking');
      await audioEngineInstance.speakFallback(assistantText);
      setAssistantState('idle');
      return;
    }

    // 2. Online Mode - Query Gemini Server
    try {
      const response = await fetch('/api/voice-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInputText,
          history: messages.slice(-6),
          locationInfo: { city: 'Mumbai', temp: '31°C Clear' },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Voice service error');
      }

      const data = await response.json();
      const assistantText = data.text || 'Bilkul! I understand.';

      // Process device tool calls if returned
      let executedTool: any = null;
      if (data.functionCalls && data.functionCalls.length > 0) {
        const toolCall = data.functionCalls[0];
        executedTool = {
          name: toolCall.name,
          args: toolCall.args,
          status: 'executed',
        };

        const result = await bridge.executeTool(
          toolCall.name,
          toolCall.args || {},
          (dialogType, meta) => {
            if (dialogType === 'call_prompt') {
              setCallModalConfig({
                isOpen: true,
                contactName: meta?.contactName || 'Contact',
                phone: meta?.phone || '',
              });
            } else {
              setSystemDialogConfig({ isOpen: true, type: dialogType, metadata: meta });
            }
          }
        );

        if (!result.success && result.requiresPermission) {
          executedTool.status = 'permission_denied';
          // Prompt user to enable the permission
          handleOpenAppInfoScreen(result.requiresPermission);
        }

        // Special UI triggers
        if (toolCall.name === 'openCamera') {
          setIsScanOpen(true);
        } else if (toolCall.name === 'controlMusic') {
          setIsMusicWidgetOpen(true);
          setIsMusicPlaying(true);
        }
      }

      const assistantMsg: ChatMessage = {
        id: 'ast_' + Date.now(),
        role: 'assistant',
        text: assistantText,
        timestamp: Date.now(),
        toolCall: executedTool,
      };

      const updatedHistory = [...currentHistory, assistantMsg];
      setMessages(updatedHistory);
      try {
        localStorage.setItem('priya_chat_messages_v1', JSON.stringify(updatedHistory));
      } catch {}

      // Cache this turn in localStorage for offline availability!
      cacheManager.cacheTurn(userInputText, assistantText, executedTool?.name);

      // Play vocalized response
      if (data.audioBase64) {
        setAssistantState('speaking');
        await audioEngineInstance.playAudioBase64(data.audioBase64);
      } else {
        setAssistantState('speaking');
        await audioEngineInstance.speakFallback(assistantText);
      }

      setAssistantState('idle');
    } catch (err: any) {
      console.warn('Voice turn error, attempting offline cache fallback:', err);

      // Offline Cache Fallback upon network failure
      const cached = cacheManager.getCachedResponse(userInputText);
      if (cached) {
        const assistantMsg: ChatMessage = {
          id: 'ast_cached_fallback_' + Date.now(),
          role: 'assistant',
          text: cached.response,
          timestamp: Date.now(),
          isCached: true,
        };
        const nextMessages = [...currentHistory, assistantMsg];
        setMessages(nextMessages);
        try {
          localStorage.setItem('priya_chat_messages_v1', JSON.stringify(nextMessages));
        } catch {}

        setAssistantState('speaking');
        await audioEngineInstance.speakFallback(cached.response);
        setAssistantState('idle');
        return;
      }

      setAssistantState('error');
      setErrorMessage(
        err.message || 'Priya voice service is temporarily unavailable. Check network connection.'
      );

      // Add clear offline message
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        text: 'Network connection error. Priya offline cache mein iska answer nahi mila. Kripya connect hone par dubara try karein.',
        timestamp: Date.now(),
      };
      const nextMessages = [...currentHistory, errorMsg];
      setMessages(nextMessages);
      try {
        localStorage.setItem('priya_chat_messages_v1', JSON.stringify(nextMessages));
      } catch {}

      audioEngineInstance.speakFallback(errorMsg.text);

      setTimeout(() => {
        setAssistantState('idle');
        setErrorMessage(null);
      }, 5000);
    }
  };

  // Helper to trigger assistant speech
  const triggerPriyaSpeech = async (text: string) => {
    try {
      setAssistantState('speaking');
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const { audioBase64 } = await res.json();
        if (audioBase64) {
          await audioEngineInstance.playAudioBase64(audioBase64);
          setAssistantState('idle');
          return;
        }
      }
      await audioEngineInstance.speakFallback(text);
      setAssistantState('idle');
    } catch {
      await audioEngineInstance.speakFallback(text);
      setAssistantState('idle');
    }
  };

  // Quick Action Click Handler
  const handleQuickAction = (action: 'music' | 'study' | 'journal') => {
    if (action === 'music') {
      setIsMusicWidgetOpen(true);
      const newState = bridge.toggleMusic();
      setIsMusicPlaying(newState.isPlaying);
      triggerPriyaSpeech(
        newState.isPlaying
          ? `Playing ${newState.title} on Priya Ambient Radio`
          : 'Music playback paused.'
      );
    } else if (action === 'study') {
      handleUserSpeechInput('Priya, let’s do a study focus session for 25 minutes.');
    } else if (action === 'journal') {
      setIsMemoriesOpen(true);
    }
  };

  // Scan frame vision analysis
  const handleAnalyzeFrame = (imageDataUrl: string) => {
    handleUserSpeechInput(
      'Priya, maine ye scan kiya hai. Can you check what this is or summarize it for me?'
    );
  };

  // Navigation tab switcher
  const handleTabChange = (tab: 'home' | 'scan' | 'memories' | 'chat') => {
    setCurrentTab(tab);
    if (tab === 'scan') {
      setIsScanOpen(true);
    } else if (tab === 'memories') {
      setIsMemoriesOpen(true);
    } else if (tab === 'chat') {
      setIsChatOpen(true);
    }
  };

  // ================= STEPPER VIEWS =================
  if (setupStep === 1) {
    return <Step1Welcome onContinue={handleStep1Continue} />;
  }

  if (setupStep === 2) {
    return (
      <>
        <Step2Permissions
          permissions={permissions}
          onPermissionsChange={refreshPermissions}
          onContinue={handleStep2Continue}
          onOpenSettingsModal={handleOpenAppInfoScreen}
        />
        <AndroidSettingsModal
          config={systemDialogConfig}
          onClose={() => setSystemDialogConfig({ ...systemDialogConfig, isOpen: false })}
          onPermissionUpdated={refreshPermissions}
        />
      </>
    );
  }

  if (setupStep === 3) {
    return (
      <>
        <Step3Background
          advancedPermissions={advancedPermissions}
          onOpenSystemScreen={handleOpenSystemScreen}
          onFinish={handleStep3Finish}
        />
        <AndroidSettingsModal
          config={systemDialogConfig}
          onClose={() => setSystemDialogConfig({ ...systemDialogConfig, isOpen: false })}
          onPermissionUpdated={refreshPermissions}
        />
      </>
    );
  }

  // ================= MAIN HOME SCREEN (MATCHING SCREENSHOT 2) =================
  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between max-w-md mx-auto relative font-sans overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Background ambient gradient glow matching Maya/Priya aesthetic */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col justify-between z-10">
        {/* Top Header Bar */}
        <TopBar
          onOpenMenu={() => setIsMenuOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadCount={2}
          userName={userName}
        />

        {/* Offline Cache Alert Banner */}
        {isOffline && (
          <div className="mx-4 my-1 px-3.5 py-2 rounded-2xl bg-amber-950/70 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2 min-w-0">
              <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div className="min-w-0">
                <span className="font-semibold block truncate">Priya is in Offline Mode</span>
                <span className="text-[10px] text-amber-300/80 truncate block">
                  Serving cached responses & weather from localStorage
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsWeatherModalOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider flex-shrink-0 transition-colors ml-2"
            >
              Cache Sync
            </button>
          </div>
        )}

        {/* Free Mode Subscription Banner */}
        <SubscriptionBanner />

        {/* Dynamic Greeting & Energy Badge */}
        <GreetingHeader
          userName={userName}
          assistantState={assistantState}
          onWakeAssistant={handleWakeWordTrigger}
          onOpenEnergyDashboard={() => setIsEnergyDashboardOpen(true)}
        />

        {/* Futuristic Glowing AI Core (P.R.I.Y.A.) with Real Waveform */}
        <PriyaCoreVisualizer
          assistantState={assistantState}
          audioVolume={audioVolume}
          frequencies={frequencies}
          onClick={handleToggleVoice}
        />

        {/* Quick Action Pills: Music, Study, Journal */}
        <QuickActionPills
          onActionClick={handleQuickAction}
          isMusicPlaying={isMusicPlaying}
        />

        {/* Information Cards: Weather, Today, Mood */}
        <InformationCards
          isOffline={isOffline}
          onCardClick={(card) => {
            if (card === 'weather') {
              setIsWeatherModalOpen(true);
            } else if (card === 'today') {
              handleUserSpeechInput('Priya, do I have any reminders or events scheduled for today?');
            }
          }}
        />

        {/* Error Toast Notification if Service Offline */}
        {errorMessage && (
          <div className="mx-4 my-1 p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between animate-in fade-in">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 p-1">
              ✕
            </button>
          </div>
        )}

        {/* Chat Input Bar */}
        <ChatInputBar
          onSendMessage={handleUserSpeechInput}
          onAttachMedia={() => setIsScanOpen(true)}
          disabled={assistantState === 'thinking'}
        />
      </div>

      {/* Bottom Navigation with Center Elevated Mic */}
      <BottomNavigation
        currentTab={currentTab}
        onTabChange={handleTabChange}
        assistantState={assistantState}
        onToggleVoice={handleToggleVoice}
      />

      {/* Floating Assistant Orb ("Display over other apps") */}
      <FloatingOrb
        enabled={floatingOrbEnabled}
        assistantState={assistantState}
        onActivate={handleToggleVoice}
      />

      {/* Music Player Widget */}
      <MusicPlayerWidget
        isOpen={isMusicWidgetOpen}
        onClose={() => setIsMusicWidgetOpen(false)}
        isPlaying={isMusicPlaying}
        onTogglePlay={() => {
          const res = bridge.toggleMusic();
          setIsMusicPlaying(res.isPlaying);
        }}
      />

      {/* Modals & Drawers */}
      <SideDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        floatingOrbEnabled={floatingOrbEnabled}
        onToggleFloatingOrb={() => {
          const next = !floatingOrbEnabled;
          setFloatingOrbEnabled(next);
          pm.updateAdvancedStatus('overlay', next ? 'GRANTED' : 'DENIED');
        }}
        wakeWordEnabled={wakeWordEnabled}
        onToggleWakeWord={() => setWakeWordEnabled(!wakeWordEnabled)}
        onReviewPermissions={() => {
          setSetupStep(2);
        }}
        onOpenEnergyDashboard={() => {
          setIsMenuOpen(false);
          setIsEnergyDashboardOpen(true);
        }}
        onOpenWeatherModal={() => {
          setIsMenuOpen(false);
          setIsWeatherModalOpen(true);
        }}
      />

      {/* Energy Efficiency Dashboard Modal */}
      <EnergyEfficiencyModal
        isOpen={isEnergyDashboardOpen}
        onClose={() => setIsEnergyDashboardOpen(false)}
        onApplyTipsSpeech={triggerPriyaSpeech}
      />

      {/* Weather Detail & Offline Cache Sync Modal */}
      <WeatherDetailModal
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
        onSpeakWeather={triggerPriyaSpeech}
        onWeatherUpdated={() => {
          setIsOffline(cacheManager.isNetworkOffline());
        }}
      />

      <NotificationShadeModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onReadAloud={(text) => {
          setIsNotificationsOpen(false);
          triggerPriyaSpeech(text);
        }}
      />

      <ScanViewfinderModal
        isOpen={isScanOpen}
        onClose={() => {
          setIsScanOpen(false);
          setCurrentTab('home');
        }}
        onAnalyzeFrame={handleAnalyzeFrame}
      />

      <MemoriesModal
        isOpen={isMemoriesOpen}
        onClose={() => {
          setIsMemoriesOpen(false);
          setCurrentTab('home');
        }}
      />

      <ChatHistoryModal
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setCurrentTab('home');
        }}
        messages={messages}
        onPlaySpeech={triggerPriyaSpeech}
        onClearHistory={() => {
          setMessages([]);
          localStorage.removeItem('priya_chat_messages_v1');
          cacheManager.clearCache();
        }}
      />

      <CallPromptModal
        isOpen={callModalConfig.isOpen}
        contactName={callModalConfig.contactName}
        phone={callModalConfig.phone}
        onClose={() => setCallModalConfig({ ...callModalConfig, isOpen: false })}
      />

      <AndroidSettingsModal
        config={systemDialogConfig}
        onClose={() => setSystemDialogConfig({ ...systemDialogConfig, isOpen: false })}
        onPermissionUpdated={refreshPermissions}
      />
    </div>
  );
}
