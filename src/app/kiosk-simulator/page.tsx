"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Lock,
  Unlock,
  Radio,
  Zap,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Volume2,
  VolumeX,
  CreditCard,
  Fingerprint,
  CheckCircle2,
  PackageCheck,
  PackageX,
  ArrowRight,
  Server,
  Wrench,
  Siren,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { HardwareRadarModal } from "@/components/HardwareRadarModal";

interface Compartment {
  id: string;
  compartmentNumber: number;
  status: string;
  solenoidLocked: boolean;
  doorPhysicalOpen: boolean;
  irSensorBreakBeam: boolean;
  chargingConnected: boolean;
  asset: {
    id: string;
    serialNumber: string;
    usbVendorId: string;
    usbProductId: string;
    condition: string;
    sku: {
      name: string;
      modelNumber: string;
    };
  } | null;
  tickets: Array<{
    id: string;
    itsmExternalId: string;
    status: string;
    accessPinHash: string;
    user: {
      name: string;
      rfidBadgeId: string;
    };
    meetingRoom: {
      name: string;
    };
  }>;
}

interface Locker {
  id: string;
  name: string;
  floor: number;
  locationNote: string;
  onlineStatus: boolean;
  temperatureC: number;
  compartments: Compartment[];
}

function KioskSimulatorContent() {
  const searchParams = useSearchParams();
  const urlLocker = searchParams.get("locker");
  const urlPin = searchParams.get("pin");

  const [lockers, setLockers] = useState<Locker[]>([]);
  const [isLoadingLockers, setIsLoadingLockers] = useState<boolean>(true);
  const [lockerLoadError, setLockerLoadError] = useState<string | null>(null);
  const [selectedLockerId, setSelectedLockerId] = useState<string>(
    urlLocker || "lkr_floor4"
  );
  const [pinInput, setPinInput] = useState<string>(
    (urlPin || "").replace(/\D/g, "").slice(0, 6)
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [kioskMessage, setKioskMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState<boolean>(false);

  useEffect(() => {
    if (urlLocker) setSelectedLockerId(urlLocker);
    if (urlPin) setPinInput(urlPin.replace(/\D/g, "").slice(0, 6));
  }, [urlLocker, urlPin]);

  // Synthetic tactile keypad click sound (800Hz beep)
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  };

  // Enhanced Dual-Frequency Mechanical Solenoid Clack (Section 8.1)
  const playSolenoidSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Impulse 1: 120Hz fundamental mechanical solenoid thud
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(120, ctx.currentTime);
      gain1.gain.setValueAtTime(0.2, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.04);

      // Impulse 2: 800Hz latch release at +45ms
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = "triangle";
          osc2.frequency.setValueAtTime(800, ctx.currentTime);
          gain2.gain.setValueAtTime(0.12, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.035);
        } catch {}
      }, 45);
    } catch {}
  };

  // Fetch initial lockers state and session
  const refreshLockers = () => {
    fetch("/api/lockers")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.lockers) {
          throw new Error(
            data.error?.message || "Unable to load smart locker inventory."
          );
        }
        setLockers(data.lockers);
        setLockerLoadError(null);
      })
      .catch((err) => {
        setLockerLoadError(
          err instanceof Error
            ? err.message
            : "Unable to connect to smart locker controller."
        );
      })
      .finally(() => {
        setIsLoadingLockers(false);
      });
  };

  useEffect(() => {
    refreshLockers();
    fetch("/api/session/current")
      .then((res) => res.json())
      .then((data) => {
        if (data.session) setActiveSession(data.session);
      })
      .catch(() => {});
  }, []);

  // Real-time telemetry listener: auto-refresh locker bays on any event
  useTelemetry(() => {
    refreshLockers();
  });

  const activeLocker =
    lockers.find((l) => l.id === selectedLockerId) || lockers[0];

  const handleKeypadPress = (val: string) => {
    playClickSound();
    if (val === "CLEAR") {
      setPinInput("");
      if (isError) {
        setKioskMessage(null);
        setIsError(false);
      }
    } else if (val === "ENTER") {
      handlePinUnlock();
    } else {
      if (pinInput.length < 6) {
        setPinInput((prev) => prev + val);
        if (isError) {
          setKioskMessage(null);
          setIsError(false);
        }
      }
    }
  };

  const handlePinUnlock = async () => {
    if (!activeLocker) {
      setKioskMessage(
        isLoadingLockers
          ? "Connecting to smart locker controller. Please wait a moment and try again."
          : lockerLoadError || "Smart locker controller unavailable. Please refresh the terminal."
      );
      setIsError(true);
      return;
    }

    if (!/^\d{6}$/.test(pinInput)) {
      setKioskMessage("Please enter a valid 6-digit PIN.");
      setIsError(true);
      return;
    }

    setIsSubmitting(true);
    setKioskMessage(null);
    setIsError(false);

    try {
      const res = await fetch("/api/kiosk/authenticate-and-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lockerId: activeLocker.id,
          accessPin: pinInput,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playSolenoidSound();
        setKioskMessage(data.message);
        setIsError(false);
        setPinInput("");
        refreshLockers();
      } else {
        setKioskMessage(
          data.error?.message || "Invalid or expired reservation PIN."
        );
        setIsError(true);
      }
    } catch {
      setKioskMessage("Communication timeout with smart locker controller.");
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRfidTap = async () => {
    if (!activeLocker) return;
    setIsSubmitting(true);
    setKioskMessage(null);
    setIsError(false);

    try {
      const res = await fetch("/api/kiosk/authenticate-and-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lockerId: activeLocker.id,
          rfidBadgeId: activeSession?.rfidBadgeId || "RFID-EMP-8821",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playSolenoidSound();
        setKioskMessage(data.message);
        setIsError(false);
        refreshLockers();
      } else {
        setKioskMessage(
          data.error?.message || "No active hardware reservation linked to this badge."
        );
        setIsError(true);
      }
    } catch {
      setKioskMessage("RFID Reader controller failure.");
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAsset = async (bayNumber: number) => {
    if (!activeLocker) return;
    playClickSound();

    try {
      const res = await fetch("/api/kiosk/remove-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lockerId: activeLocker.id,
          compartmentNumber: bayNumber,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setKioskMessage(data.message);
        setIsError(false);
        refreshLockers();
      } else {
        setKioskMessage(data.error?.message || "Failed to confirm item removal.");
        setIsError(true);
      }
    } catch {
      setKioskMessage("Error acknowledging removal.");
      setIsError(true);
    }
  };

  const handleReturnAsset = async (bay: Compartment) => {
    if (!activeLocker || !bay.asset) return;
    playClickSound();

    try {
      const res = await fetch("/api/kiosk/return-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lockerId: activeLocker.id,
          compartmentNumber: bay.compartmentNumber,
          assetSerialNumber: bay.asset.serialNumber,
          usbVendorId: bay.asset.usbVendorId,
          usbProductId: bay.asset.usbProductId,
          chargingConnected: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playSolenoidSound();
        setKioskMessage(data.message);
        setIsError(false);
        refreshLockers();
      } else {
        setKioskMessage(data.error?.message || "Return verification failed.");
        setIsError(true);
      }
    } catch {
      setKioskMessage("Return inspection error.");
      setIsError(true);
    }
  };

  const handleForeignDeviceAlarm = async (bayNumber: number) => {
    if (!activeLocker) return;
    playClickSound();

    try {
      const res = await fetch("/api/kiosk/report-foreign-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lockerId: activeLocker.id,
          compartmentNumber: bayNumber,
          foreignVendorId: "0x16C0",
          foreignProductId: "0x05DF",
          simulatedAttackVector: "BadUSB HID Keystroke Injection Exploit",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setKioskMessage(data.message);
        setIsError(true);
        refreshLockers();
      }
    } catch {
      // Failed to trigger alarm
    }
  };

  // Interactive Local Sensor State Toggles (Section 8.2)
  const toggleBaySensor = (bayNumber: number, field: "irSensorBreakBeam" | "chargingConnected") => {
    playClickSound();
    setLockers((prev) =>
      prev.map((lkr) => {
        if (lkr.id !== activeLocker?.id) return lkr;
        return {
          ...lkr,
          compartments: lkr.compartments.map((comp) => {
            if (comp.compartmentNumber !== bayNumber) return comp;
            return {
              ...comp,
              [field]: !comp[field],
            };
          }),
        };
      })
    );
  };

  const isItAdmin = activeSession?.role === "IT_ADMIN";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Loading Radar Modal during submission */}
      <HardwareRadarModal
        visible={isSubmitting}
        title="Connecting to Smart Locker Solenoids..."
        message="Authorizing hardware solenoid channel with zero-trust enclave..."
        subsystem="IOT_SOLENOID_DISPATCH"
      />

      {/* Kiosk Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
            <Server className="w-3.5 h-3.5" /> IoT Smart Locker Hardware Simulator v1.0.3
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Floor Locker Bank Terminal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Simulates physical 12-bay smart locker with dual-frequency solenoid actuators, IR break-beam sensors, and 5V/3A charging bays.
          </p>
        </div>

        {/* Locker Location Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {lockers.map((locker) => (
            <button
              key={locker.id}
              onClick={() => {
                setSelectedLockerId(locker.id);
                setKioskMessage(null);
              }}
              className={`px-3 sm:px-4 py-2 min-h-[38px] rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                selectedLockerId === locker.id
                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Floor {locker.floor}: {locker.name.split(" ")[2]} Hub
            </button>
          ))}
        </div>
      </div>

      {/* IT Admin Emergency Override Panel (Section 8.3) */}
      {isItAdmin && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 glass-chamfer">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setAdminPanelOpen(!adminPanelOpen)}>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
              <Wrench className="w-4 h-4" />
              <span>IT Administrator Emergency Override Panel</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">PRIVILEGED</span>
            </div>
            <button className="text-emerald-400 p-1">
              {adminPanelOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {adminPanelOpen && (
            <div className="mt-4 pt-3 border-t border-emerald-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <button
                onClick={() => {
                  playSolenoidSound();
                  setKioskMessage("[IT_OVERRIDE] Emergency pulse sent to all 12 bay solenoid latches.");
                  setIsError(false);
                }}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Emergency Unlock All Bays</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setKioskMessage("[IT_TEST] Maintenance quarantine sequence triggered on Bay #7.");
                  setIsError(true);
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2"
              >
                <Siren className="w-3.5 h-3.5" />
                <span>Force Quarantine Flashing</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setKioskMessage("[IT_RESET] All tamper sensors & break-beam alarms cleared.");
                  setIsError(false);
                  refreshLockers();
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset System Alarms</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Split-Screen: Locker Bank Grid (8 cols) & Keypad/Controls (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: 12-Bay Visual Locker Bank (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Locker Status Bar */}
          {activeLocker && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-3 rounded-xl border border-border bg-card text-xs glass-chamfer">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="font-bold text-foreground">
                  {activeLocker.name}
                </span>
                <span className="text-muted-foreground">
                  Floor {activeLocker.floor} • {activeLocker.locationNote}
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-emerald-500 flex items-center gap-1 font-semibold">
                  ● ONLINE
                </span>
                <span className="text-muted-foreground">
                  Temp: {activeLocker.temperatureC}°C
                </span>
              </div>
            </div>
          )}

          {/* 12-Compartment Grid (3 rows of 4) */}
          {!activeLocker && isLoadingLockers ? (
            <div className="p-8 rounded-2xl border border-border/80 bg-secondary/30 text-center text-xs text-muted-foreground glass-chamfer">
              Connecting to Smart Locker controller...
            </div>
          ) : !activeLocker && lockerLoadError ? (
            <div className="p-6 rounded-2xl border border-destructive/30 bg-destructive/10 text-center space-y-3">
              <div className="text-xs font-semibold text-destructive">
                {lockerLoadError}
              </div>
              <button
                onClick={() => {
                  setIsLoadingLockers(true);
                  refreshLockers();
                }}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-secondary/30 dark:bg-slate-900/50 p-4 rounded-2xl border border-border/80 glass-chamfer">
              {activeLocker?.compartments.map((comp) => {
                const isReserved = comp.status === "RESERVED_FOR_PICKUP";
                const isDoorOpen = comp.doorPhysicalOpen || comp.status === "DOOR_OPEN_AWAITING_REMOVAL";
                const isCheckedOut = comp.status === "CHECKED_OUT";
                const isQuarantined = comp.status === "MAINTENANCE_QUARANTINE";

                return (
                  <div
                    key={comp.id}
                    className={`relative p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between min-h-[175px] glass-chamfer ${
                      isQuarantined
                        ? "border-destructive bg-destructive/10 animate-pulse-subtle dark:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        : isDoorOpen
                        ? "border-sky-500 bg-sky-500/10 shadow-lg shadow-sky-500/10 dark:shadow-[0_0_20px_rgba(56,189,248,0.25)]"
                        : isReserved
                        ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10 dark:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                        : isCheckedOut
                        ? "border-border/60 bg-secondary/30 text-muted-foreground"
                        : "border-border/80 bg-card/90 hover:border-primary/40 dark:hover:border-primary/50"
                    }`}
                  >
                    {/* Top: Bay Number & Status Indicator */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black text-muted-foreground">
                        BAY #{comp.compartmentNumber}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Solenoid Lock Icon */}
                        {comp.solenoidLocked ? (
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5 text-sky-400 animate-bounce" />
                        )}

                        {/* Status LED with Diffused Glow */}
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isQuarantined
                              ? "bg-destructive animate-ping shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                              : isDoorOpen
                              ? "bg-sky-400 animate-pulse shadow-[0_0_10px_rgba(56,189,248,0.8)]"
                              : isReserved
                              ? "bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                              : isCheckedOut
                              ? "bg-muted-foreground/30"
                              : "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Middle: Asset Information */}
                    <div className="my-2 space-y-1">
                      <div className="text-[11px] font-bold line-clamp-2 text-foreground">
                        {comp.asset?.sku.name || "Empty Bay"}
                      </div>
                      {comp.asset && (
                        <div className="text-[9px] font-mono text-muted-foreground truncate">
                          S/N: {comp.asset.serialNumber}
                        </div>
                      )}
                      {isReserved && comp.tickets[0] && (
                        <div className="text-[9px] font-bold text-amber-500 truncate">
                          Reserved: {comp.tickets[0].user.name}
                        </div>
                      )}
                    </div>

                    {/* Sensor Badges with Interactive Simulation Toggles (Section 8.2) */}
                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px]">
                      {/* IR Break-Beam Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleBaySensor(comp.compartmentNumber, "irSensorBreakBeam")}
                        title="Click to toggle IR Break-Beam Sensor simulation"
                        className="flex items-center gap-1 p-0.5 rounded hover:bg-secondary/80 transition-colors"
                      >
                        {comp.irSensorBreakBeam ? (
                          <PackageCheck className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <PackageX className="w-3 h-3 text-muted-foreground" />
                        )}
                        <span className={comp.irSensorBreakBeam ? "text-emerald-400 font-semibold" : "text-muted-foreground"}>
                          {comp.irSensorBreakBeam ? "ITEM" : "CLEAR"}
                        </span>
                      </button>

                      {/* 5V/3A Power Continuity Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleBaySensor(comp.compartmentNumber, "chargingConnected")}
                        title="Click to toggle 5V/3A Smart Charging continuity"
                        className="flex items-center gap-1 p-0.5 rounded hover:bg-secondary/80 transition-colors"
                      >
                        <Zap
                          className={`w-3 h-3 ${
                            comp.chargingConnected ? "text-amber-400" : "text-muted-foreground"
                          }`}
                        />
                        <span className={comp.chargingConnected ? "text-amber-400 font-semibold" : "text-muted-foreground"}>
                          {comp.chargingConnected ? "5V/3A" : "OFF"}
                        </span>
                      </button>
                    </div>

                    {/* Interactive Action Overlay when Door is Open */}
                    {isDoorOpen && (
                      <div className="absolute inset-0 bg-background/95 rounded-xl p-2.5 flex flex-col justify-center gap-1.5 z-10 animate-in fade-in duration-150">
                        <div className="text-[10px] font-bold text-center text-sky-400 uppercase tracking-wider font-mono">
                          Door Solenoid Released
                        </div>
                        <button
                          onClick={() => handleRemoveAsset(comp.compartmentNumber)}
                          className="w-full py-1.5 px-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px] transition-all cursor-pointer"
                        >
                          Take Device (IR Break)
                        </button>
                        <button
                          onClick={() => handleForeignDeviceAlarm(comp.compartmentNumber)}
                          className="w-full py-1 px-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium text-[9px] transition-all cursor-pointer"
                        >
                          Simulate Foreign BadUSB
                        </button>
                      </div>
                    )}

                    {/* Action Overlay when Checked Out (Allow Return) */}
                    {isCheckedOut && comp.asset && (
                      <div className="mt-1">
                        <button
                          onClick={() => handleReturnAsset(comp)}
                          className="w-full py-1 px-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-foreground font-bold text-[9px] transition-colors border border-border flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-2.5 h-2.5" /> Return & Plug
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Tactile Kiosk Keypad & Auth Console (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl space-y-6 glass-chamfer dark:shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
            {/* Terminal Top Meta */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                <Radio className="w-3.5 h-3.5 text-primary" /> Kiosk Access Terminal
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title={soundEnabled ? "Mute Solenoid Audio" : "Enable Solenoid Audio"}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-primary" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* PIN Input Display */}
            <div className="p-4 rounded-xl bg-secondary/80 dark:bg-slate-900/80 border border-border/80 text-center space-y-1 glass-chamfer">
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider font-mono">
                Enter 6-Digit Reservation OTP
              </div>
              <div className="h-10 flex items-center justify-center font-mono text-2xl font-black tracking-widest text-foreground">
                {pinInput ? pinInput.padEnd(6, "•") : "••••••"}
              </div>
            </div>

            {/* Tactile Numeric Keypad (10-key grid) */}
            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "CLEAR", "0", "ENTER"].map(
                (btn) => {
                  const isEnter = btn === "ENTER";
                  const isClear = btn === "CLEAR";

                  return (
                    <button
                      key={btn}
                      onClick={() => handleKeypadPress(btn)}
                      disabled={isSubmitting || (isEnter && isLoadingLockers)}
                      className={`h-12 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center cursor-pointer active:scale-95 select-none disabled:opacity-50 disabled:cursor-not-allowed ${
                        isEnter
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs shadow-md shadow-primary/30 active:scale-95 glass-chamfer"
                          : isClear
                          ? "bg-secondary/90 text-muted-foreground hover:text-foreground text-xs active:scale-95 glass-chamfer border border-border/60"
                          : "bg-card/90 hover:bg-secondary/90 text-foreground text-base border border-border/80 shadow-xs active:scale-95 glass-chamfer"
                      }`}
                    >
                      {btn}
                    </button>
                  );
                }
              )}
            </div>

            {/* Fast-Track RFID Tap */}
            <div className="pt-4 border-t border-border space-y-2">
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider text-center font-mono">
                Multi-Factor Kiosk Verification
              </div>
              <button
                onClick={handleRfidTap}
                disabled={isSubmitting || isLoadingLockers}
                className="w-full py-2.5 px-3 rounded-xl bg-secondary/80 hover:bg-secondary border border-border text-foreground font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="w-4 h-4 text-primary" />
                <span>Tap Corporate RFID ({activeSession?.rfidBadgeId || "RFID-EMP-8821"})</span>
              </button>
            </div>

            {/* Kiosk Status & Messages */}
            {kioskMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium border animate-in fade-in duration-200 ${
                  isError
                    ? "bg-destructive/10 border-destructive/20 text-destructive"
                    : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400"
                }`}
              >
                <div className="flex items-start gap-2">
                  {isError ? (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{kioskMessage}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KioskSimulatorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading Kiosk Simulator...</div>}>
      <KioskSimulatorContent />
    </Suspense>
  );
}
