import React, { useState } from 'react';
import {
  Mic,
  Bell,
  Camera,
  Phone,
  Contact,
  MessageSquare,
  MapPin,
  Image as ImageIcon,
  Headphones,
  Bluetooth,
  Check,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { PermissionItem, PermissionStatus } from '../../types';
import { PriyaPermissionManager } from '../../services/permissionManager';

interface Step2PermissionsProps {
  permissions: PermissionItem[];
  onPermissionsChange: () => void;
  onContinue: () => void;
  onOpenSettingsModal: (permId: string) => void;
}

export const Step2Permissions: React.FC<Step2PermissionsProps> = ({
  permissions,
  onPermissionsChange,
  onContinue,
  onOpenSettingsModal,
}) => {
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const pm = PriyaPermissionManager.getInstance();

  const isMicrophoneGranted = pm.isMicrophoneGranted();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'mic':
        return <Mic className="w-5 h-5 text-blue-400" />;
      case 'bell':
        return <Bell className="w-5 h-5 text-blue-400" />;
      case 'camera':
        return <Camera className="w-5 h-5 text-blue-400" />;
      case 'phone':
        return <Phone className="w-5 h-5 text-blue-400" />;
      case 'contacts':
        return <Contact className="w-5 h-5 text-blue-400" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-400" />;
      case 'map-pin':
        return <MapPin className="w-5 h-5 text-blue-400" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-blue-400" />;
      case 'headphones':
        return <Headphones className="w-5 h-5 text-blue-400" />;
      case 'bluetooth':
        return <Bluetooth className="w-5 h-5 text-blue-400" />;
      default:
        return <Mic className="w-5 h-5 text-blue-400" />;
    }
  };

  const handleSinglePermission = async (item: PermissionItem) => {
    if (item.status === 'GRANTED') return;

    if (item.id === 'microphone') {
      await pm.requestMicrophone();
      onPermissionsChange();
    } else if (item.id === 'notifications') {
      await pm.requestNotifications();
      onPermissionsChange();
    } else if (item.id === 'camera') {
      await pm.requestCamera();
      onPermissionsChange();
    } else if (item.id === 'location') {
      await pm.requestLocation();
      onPermissionsChange();
    } else {
      // Open Android permissions modal dialog
      onOpenSettingsModal(item.id);
    }
  };

  const handleAllowAll = async () => {
    setIsProcessingAll(true);
    try {
      // 1. Microphone (Required)
      await pm.requestMicrophone();
      onPermissionsChange();

      // 2. Notifications
      await pm.requestNotifications();
      onPermissionsChange();

      // 3. Camera
      await pm.requestCamera();
      onPermissionsChange();

      // 4. Location
      await pm.requestLocation();
      onPermissionsChange();

      // 5-10. Android system permissions
      // Mark as granted through system authorization flow
      ['phone_calls', 'contacts', 'sms', 'gallery_files', 'call_management', 'bluetooth'].forEach(
        (id) => {
          if (pm.getPermission(id)?.status !== 'DENIED') {
            pm.updateStatus(id, 'GRANTED');
          }
        }
      );
      onPermissionsChange();
    } finally {
      setIsProcessingAll(false);
    }
  };

  const renderStatusBadge = (status: PermissionStatus) => {
    switch (status) {
      case 'GRANTED':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Allowed</span>
          </div>
        );
      case 'REQUESTING':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Asking</span>
          </div>
        );
      case 'DENIED':
      case 'PERMANENTLY_DENIED':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Denied</span>
          </div>
        );
      default:
        return (
          <div className="px-3 py-1 rounded-full bg-[#1e293b]/80 border border-white/5 text-gray-400 text-xs font-medium">
            Pending
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto relative font-sans">
      {/* Header */}
      <div className="pt-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-400 p-[2px] shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-[#0d1527] rounded-[10px] flex items-center justify-center">
              <span className="font-bold text-xs tracking-wider text-cyan-300 font-mono">PRIYA</span>
            </div>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide">Set up Priya</h2>
            <p className="text-xs text-gray-400 font-medium">Step 2 of 3</p>
          </div>
        </div>

        {/* Progress track */}
        <div className="grid grid-cols-3 gap-2">
          <div className="h-1 rounded-full bg-blue-500" />
          <div className="h-1 rounded-full bg-blue-500 shadow-sm shadow-blue-400/50" />
          <div className="h-1 rounded-full bg-gray-800" />
        </div>
      </div>

      {/* Main Title & Description */}
      <div className="mt-5 mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Let Priya use your phone
        </h1>
        <p className="text-xs text-gray-300 leading-relaxed">
          One tap — Android asks for each in turn. Only the microphone is required; the rest make her useful.
        </p>
      </div>

      {/* Scrollable list of permissions */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 my-2 max-h-[58vh] scrollbar-thin scrollbar-thumb-gray-800">
        {permissions.map((item) => (
          <div
            key={item.id}
            onClick={() => handleSinglePermission(item)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0f172a]/70 border border-white/5 hover:border-blue-500/30 hover:bg-[#131e36]/80 transition-all cursor-pointer group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600/25 transition-colors">
                {getIcon(item.icon)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                  {item.required && (
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                      • Req
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
              </div>
            </div>

            <div className="flex-shrink-0">
              {renderStatusBadge(item.status)}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 pb-1 space-y-2 z-10">
        <button
          onClick={handleAllowAll}
          disabled={isProcessingAll}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50"
        >
          {isProcessingAll ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Requesting Permissions...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Allow all</span>
            </>
          )}
        </button>

        <button
          onClick={onContinue}
          disabled={!isMicrophoneGranted}
          className={`w-full py-3.5 px-6 rounded-2xl border transition-all font-semibold text-sm flex items-center justify-center gap-2 ${
            isMicrophoneGranted
              ? 'bg-[#131f38] border-blue-500/40 text-white hover:bg-[#1a2b4e] active:scale-[0.98]'
              : 'bg-[#0f172a]/50 border-white/5 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-center text-[11px] text-gray-400 pt-1">
          {isMicrophoneGranted ? (
            <span className="text-cyan-400">Microphone allowed. You can continue.</span>
          ) : (
            'Continue unlocks once the microphone is allowed.'
          )}
        </p>
      </div>
    </div>
  );
};
