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
} from "lucide-react";
import { useTelemetry } from "@/hooks/useTelemetry";

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

  const [lockers, setLockers] = useState<Locker[]>([]);
  const [selectedLockerId, setSelectedLockerId] = useState<string>("lkr_floor4");
  const [pinInput, setPinInput] = useState<string>(searchParams.get("pin") || "");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [kioskMessage, setKioskMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Play synthetic tactile click sound
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
    } catch {
      // AudioContext unavailable
    }
  };

  // Fetch initial lockers state and session
  const refreshLockers = () => {
    fetch("/api/lockers")
      .then((res) => res.json())
      .then((data) => {
        if (data.lockers) setLockers(data.lockers);
      })
      .catch(() => {});
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
    } else if (val === "ENTER") {
      handlePinUnlock();
    } else {
      if (pinInput.length < 6) {
        setPinInput((prev) => prev + val);
      }
    }
  };

  const handlePinUnlock = async () => {
    if (!activeLocker || pinInput.length !== 6) {
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
          authMethod: "PIN",
          credentialValue: pinInput,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setKioskMessage(data.message);
        setIsError(false);
        setPinInput("");
        refreshLockers();
      } else {
        setKioskMessage(data.error?.message || "PIN Authentication failed.");
        setIsError(true);
      }
    } catch {
      setKioskMessage("Network error communicating with kiosk solenoid.");
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRfidTap = async () => {
    if (!activeLocker || !activeSession) return;
    setIsSubmitting(true);
    setKioskMessage(null);
    setIsError(false);
    playClickSound();

    try {
      const res = await fetch("/api/kiosk/authenticate-and-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lockerId: activeLocker.id,
          authMethod: "RFID",
          credentialValue: activeSession.rfidBadgeId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setKioskMessage(`RFID Badge Verified (${activeSession.rfidBadgeId}). ${data.message}`);
        setIsError(false);
        refreshLockers();
      } else {
        setKioskMessage(data.error?.message || "RFID Badge authentication failed.");
        setIsError(true);
      }
    } catch {
      setKioskMessage("RFID Reader communication failure.");
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
      if (data.success) {
        setKioskMessage(data.message);
        setIsError(false);
        refreshLockers();
      }
    } catch {
      setKioskMessage("IR sensor break-beam reporting error.");
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Kiosk Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
            <Server className="w-3.5 h-3.5" /> IoT Smart Locker Hardware Simulator
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Floor Locker Bank Terminal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Simulates physical 12-bay smart locker with solenoid actuators, IR break-beam sensors, and 5V/3A charging bays.
          </p>
        </div>

        {/* Locker Location Switcher */}
        <div className="flex items-center gap-2">
          {lockers.map((locker) => (
            <button
              key={locker.id}
              onClick={() => {
                setSelectedLockerId(locker.id);
                setKioskMessage(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
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

      {/* Split-Screen: Locker Bank Grid (8 cols) & Keypad/Controls (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: 12-Bay Visual Locker Bank (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Locker Status Bar */}
          {activeLocker && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-card text-xs">
              <div className="flex items-center gap-4">
                <span className="font-bold text-foreground">
                  {activeLocker.name}
                </span>
                <span className="text-muted-foreground">
                  Floor {activeLocker.floor} • {activeLocker.locationNote}
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-emerald-400 flex items-center gap-1">
                  ● ONLINE
                </span>
                <span className="text-muted-foreground">
                  Temp: {activeLocker.temperatureC}°C
                </span>
              </div>
            </div>
          )}

          {/* 12-Compartment Grid (3 rows of 4) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-secondary/30 p-4 rounded-2xl border border-border">
            {activeLocker?.compartments.map((comp) => {
              const isReserved = comp.status === "RESERVED_FOR_PICKUP";
              const isDoorOpen = comp.doorPhysicalOpen || comp.status === "DOOR_OPEN_AWAITING_REMOVAL";
              const isCheckedOut = comp.status === "CHECKED_OUT";
              const isQuarantined = comp.status === "MAINTENANCE_QUARANTINE";
              const isAvailable = comp.status === "STOCKED_AVAILABLE";

              return (
                <div
                  key={comp.id}
                  className={`relative p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between min-h-[170px] ${
                    isQuarantined
                      ? "border-destructive bg-destructive/10 animate-pulse-subtle"
                      : isDoorOpen
                      ? "border-sky-500 bg-sky-500/10 shadow-lg shadow-sky-500/10"
                      : isReserved
                      ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                      : isCheckedOut
                      ? "border-border/60 bg-secondary/40 text-muted-foreground"
                      : "border-border bg-card hover:border-border/80"
                  }`}
                >
                  {/* Top: Bay Number & Status Indicator */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-muted-foreground">
                      BAY #{comp.compartmentNumber}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Solenoid Lock Icon */}
                      {comp.solenoidLocked ? (
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5 text-sky-400 animate-bounce" />
                      )}

                      {/* Status LED */}
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isQuarantined
                            ? "bg-destructive animate-ping"
                            : isDoorOpen
                            ? "bg-sky-400 animate-pulse"
                            : isReserved
                            ? "bg-amber-400 animate-pulse"
                            : isCheckedOut
                            ? "bg-muted-foreground/40"
                            : "bg-emerald-400"
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
                      <div className="text-[9px] font-bold text-amber-400 truncate">
                        Reserved: {comp.tickets[0].user.name}
                      </div>
                    )}
                  </div>

                  {/* Sensor Badges */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span
                      title="IR Break-Beam Presence Sensor"
                      className="flex items-center gap-0.5"
                    >
                      {comp.irSensorBreakBeam ? (
                        <PackageCheck className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <PackageX className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span>{comp.irSensorBreakBeam ? "ITEM" : "CLEAR"}</span>
                    </span>

                    <span
                      title="5V/3A USB-C Power Continuity"
                      className="flex items-center gap-0.5"
                    >
                      <Zap
                        className={`w-3 h-3 ${
                          comp.chargingConnected
                            ? "text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span>{comp.chargingConnected ? "CHG" : "OFF"}</span>
                    </span>
                  </div>

                  {/* Interactive Action Overlay when Door is Open */}
                  {isDoorOpen && (
                    <div className="absolute inset-0 bg-background/95 rounded-xl p-2.5 flex flex-col justify-center gap-1.5 z-10 animate-in fade-in duration-150">
                      <div className="text-[10px] font-bold text-center text-sky-400 uppercase tracking-wider">
                        Door Unlocked!
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
        </div>

        {/* Right: Tactile Kiosk Keypad & Auth Console (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl border border-border bg-card shadow-xl space-y-6">
            {/* Terminal Top Meta */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <Radio className="w-3.5 h-3.5 text-primary" /> Kiosk Access Terminal
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title={soundEnabled ? "Mute Tactile Audio" : "Enable Tactile Audio"}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-primary" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* PIN Input Display */}
            <div className="p-4 rounded-xl bg-secondary/80 border border-border text-center space-y-1">
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
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
                      disabled={isSubmitting}
                      className={`h-12 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center cursor-pointer active:scale-95 select-none ${
                        isEnter
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs"
                          : isClear
                          ? "bg-secondary text-muted-foreground hover:text-foreground text-xs"
                          : "bg-secondary/60 hover:bg-secondary text-foreground text-base border border-border/50"
                      }`}
                    >
                      {btn}
                    </button>
                  );
                }
              )}
            </div>

            {/* Fast-Track RFID / Biometric Tap */}
            <div className="pt-4 border-t border-border space-y-2">
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider text-center">
                Multi-Factor Kiosk Verification
              </div>
              <button
                onClick={handleRfidTap}
                disabled={isSubmitting}
                className="w-full py-2.5 px-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <CreditCard className="w-4 h-4 text-primary" />
                <span>Tap Corporate RFID Badge ({activeSession?.rfidBadgeId || "RFID-EMP-8821"})</span>
              </button>
            </div>

            {/* Kiosk Status & Lockout Messages */}
            {kioskMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium border animate-in fade-in duration-200 ${
                  isError
                    ? "bg-destructive/10 border-destructive/20 text-destructive"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
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
