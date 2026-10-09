import React from 'react';
import {
  BatteryCharging,
  Layers,
  BellRing,
  Accessibility,
  Headphones,
  Check,
  AlertCircle
} from 'lucide-react';
import { AdvancedPermissionItem, PermissionStatus } from '../../types';

interface Step3BackgroundProps {
  advancedPermissions: AdvancedPermissionItem[];
  onOpenSystemScreen: (permId: string) => void;
  onFinish: () => void;
}

export const Step3Background: React.FC<Step3BackgroundProps> = ({
  advancedPermissions,
  onOpenSystemScreen,
  onFinish,
}) => {
  const getIcon = (id: string, isGranted: boolean) => {
    const iconColor = isGranted ? 'text-emerald-400' : 'text-blue-400';
    const bgBadge = isGranted ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-blue-600/15 border-blue-500/20';

    let iconElement;
    switch (id) {
      case 'battery':
        iconElement = <BatteryCharging className={`w-5 h-5 ${iconColor}`} />;
        break;
      case 'overlay':
        iconElement = <Layers className={`w-5 h-5 ${iconColor}`} />;
        break;
      case 'notification_access':
        iconElement = <BellRing className={`w-5 h-5 ${iconColor}`} />;
        break;
      case 'accessibility':
        iconElement = <Accessibility className={`w-5 h-5 ${iconColor}`} />;
        break;
      case 'default_assistant':
        iconElement = <Headphones className={`w-5 h-5 ${iconColor}`} />;
        break;
      default:
        iconElement = <BatteryCharging className={`w-5 h-5 ${iconColor}`} />;
    }

    return (
      <div className={`w-10 h-10 rounded-xl ${bgBadge} border flex items-center justify-center flex-shrink-0`}>
        {iconElement}
      </div>
    );
  };

  const renderStatus = (status: PermissionStatus) => {
    if (status === 'GRANTED') {
      return (
        <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <Check className="w-4 h-4 stroke-[3]" />
        </div>
      );
    }
    if (status === 'DENIED') {
      return (
        <div className="px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          <span>Denied</span>
        </div>
      );
    }
    return (
      <div className="px-3 py-1 rounded-full bg-[#1e293b]/80 border border-white/5 text-gray-400 text-xs font-medium">
        Pending
      </div>
    );
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
            <p className="text-xs text-gray-400 font-medium">Step 3 of 3</p>
          </div>
        </div>

        {/* Progress track */}
        <div className="grid grid-cols-3 gap-2">
          <div className="h-1 rounded-full bg-blue-500" />
          <div className="h-1 rounded-full bg-blue-500" />
          <div className="h-1 rounded-full bg-blue-500 shadow-sm shadow-blue-400/50" />
        </div>
      </div>

      {/* Main Title & Description */}
      <div className="mt-5 mb-3">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Keep Priya alive in the background
        </h1>
        <p className="text-xs text-gray-300 leading-relaxed">
          Battery is required — it is what stops her going quiet when the screen is off. The rest are optional but make her far more useful.
        </p>
      </div>

      {/* Scrollable list of advanced permissions */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 my-2 max-h-[58vh] scrollbar-thin scrollbar-thumb-gray-800">
        {advancedPermissions.map((item) => {
          const isGranted = item.status === 'GRANTED';
          return (
            <div
              key={item.id}
              onClick={() => onOpenSystemScreen(item.id)}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0f172a]/70 border border-white/5 hover:border-blue-500/30 hover:bg-[#131e36]/80 transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5 min-w-0 pr-3">
                {getIcon(item.id, isGranted)}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                    {item.required && (
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                        • Req
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-snug mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0">
                {renderStatus(item.status)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Informative footer text */}
      <div className="py-2">
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Tap a Pending row to open its system screen — come back here when you are done. You can change any of them later in <span className="text-gray-300 font-medium">Settings → Advanced → Permissions</span>.
        </p>
      </div>

      {/* Action Button */}
      <div className="pt-2 pb-1 z-10">
        <button
          onClick={onFinish}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Finish</span>
        </button>
      </div>
    </div>
  );
};
