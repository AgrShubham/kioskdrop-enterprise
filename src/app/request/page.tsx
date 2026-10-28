"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  QrCode,
  MapPin,
  Tv,
  AlertTriangle,
  CheckCircle2,
  Clock,
  KeyRound,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Laptop,
  Copy,
  Check,
  Radio,
  SlidersHorizontal,
} from "lucide-react";

interface MeetingRoom {
  id: string;
  name: string;
  floor: number;
  displayType: string;
  roomSystem: string;
  qrCodeSlug: string;
}

interface ReservationData {
  ticketId: string;
  itsmTicketNumber: string;
  locker: {
    id: string;
    name: string;
    floor: number;
    compartmentNumber: number;
  };
  allocatedAsset: {
    id: string;
    serialNumber: string;
    skuName: string;
    usbVendorId: string;
    usbProductId: string;
  };
  accessPin: string;
  expiresAt: string;
}

const SYMPTOMS = [
  {
    code: "SYMPTOM_NO_DISPLAY_BYOD",
    title: "Display Not Recognized (BYOD Laptop)",
    desc: "Laptop plugged in via USB-C or HDMI but meeting display shows 'No Signal'.",
    recommendedSku: "Multi-Port USB-C 4K 60W Converter",
    icon: Laptop,
    hasPortDamageToggle: true,
  },
  {
    code: "SYMPTOM_VIDEO_WALL_BLACKOUT",
    title: "LED Video Wall / Projector Blackout",
    desc: "HDCP 2.2 encryption handshake drops or video wall flashes black.",
    recommendedSku: "HDCP 2.2 Dedicated 4K Scaler",
    icon: Tv,
  },
  {
    code: "SYMPTOM_AV_DESYNC",
    title: "Out-of-Sync Audio & Video",
    desc: "Speaker lips do not match sound; video buffer latency delay.",
    recommendedSku: "Direct High-Bandwidth DisplayPort 1.4 Cable",
    icon: Radio,
  },
  {
    code: "SYMPTOM_HYBRID_PRESENTATION_CONTROL",
    title: "Hybrid Presentation Remote Needed",
    desc: "Presenter needs digital on-screen pointer visible on remote Zoom/Teams screens.",
    recommendedSku: "Logitech Spotlight BLE Presentation Remote",
    icon: SlidersHorizontal,
  },
  {
    code: "SYMPTOM_AUDIO_ECHO_HOLLOW",
    title: "Audio Screech or Hollow Voice",
    desc: "Remote participants complain of room acoustic reverberation or low mic gain.",
    recommendedSku: "Directional Boundary Presentation Mic Kit",
    icon: AlertTriangle,
  },
];

function RequestPortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [selectedRoomSlug, setSelectedRoomSlug] = useState<string>(
    searchParams.get("room") || "Boardroom-4B"
  );
  const [selectedSymptom, setSelectedSymptom] = useState<string>(
    "SYMPTOM_NO_DISPLAY_BYOD"
  );
  const [portDamaged, setPortDamaged] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<string>("10:00");

  // Fetch meeting rooms
  useEffect(() => {
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        if (data.rooms) setRooms(data.rooms);
      })
      .catch(() => {});
  }, []);

  const activeRoom =
    rooms.find((r) => r.qrCodeSlug === selectedRoomSlug) || rooms[0];

  // Countdown timer when reservation exists
  useEffect(() => {
    if (!reservation) return;

    const interval = setInterval(() => {
      const remainingMs =
        new Date(reservation.expiresAt).getTime() - Date.now();
      if (remainingMs <= 0) {
        setTimeLeft("EXPIRED");
        clearInterval(interval);
      } else {
        const m = Math.floor(remainingMs / 60000);
        const s = Math.floor((remainingMs % 60000) / 1000);
        setTimeLeft(`${m}:${s.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

  const handleReserve = async () => {
    if (!activeRoom) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/diagnose-and-reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "idempotency-key": `idemp_req_${Date.now()}`,
        },
        body: JSON.stringify({
          qrCodeSlug: activeRoom.qrCodeSlug,
          symptomCode: selectedSymptom,
          portDamaged,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReservation(data);
      } else {
        setErrorMsg(data.error?.message || "Failed to reserve hardware.");
      }
    } catch {
      setErrorMsg("Network error contacting smart-locker service.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyPin = () => {
    if (reservation?.accessPin) {
      navigator.clipboard.writeText(reservation.accessPin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
            <QrCode className="w-3.5 h-3.5" /> Rapid-Drop Meeting Room Diagnostic
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Meeting Room AV Rapid-Drop
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Instant symptom-to-hardware triage. Unlocks nearest floor locker in &lt;60 seconds.
          </p>
        </div>

        {/* Room Switcher Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-card border border-border">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => {
                setSelectedRoomSlug(room.qrCodeSlug);
                setReservation(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedRoomSlug === room.qrCodeSlug
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              {room.name.split(" ")[0]} {room.name.split(" ")[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Room Context & Symptoms (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Room Context Card */}
          {activeRoom && (
            <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Target Meeting Room
                </div>
                <div className="text-lg font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> {activeRoom.name}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-3">
                  <span>Floor: {activeRoom.floor}</span>
                  <span>•</span>
                  <span>Display: {activeRoom.displayType.replace(/_/g, " ")}</span>
                  <span>•</span>
                  <span>System: {activeRoom.roomSystem.replace(/_/g, " ")}</span>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-xs font-mono text-muted-foreground bg-secondary/80 px-2 py-1 rounded">
                  QR: {activeRoom.qrCodeSlug}
                </span>
              </div>
            </div>
          )}

          {/* Symptom Selection */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Select Current Room Symptom
            </h2>

            <div className="space-y-3">
              {SYMPTOMS.map((symptom) => {
                const Icon = symptom.icon;
                const isSelected = selectedSymptom === symptom.code;

                return (
                  <div
                    key={symptom.code}
                    onClick={() => {
                      setSelectedSymptom(symptom.code);
                      setReservation(null);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-lg mt-0.5 ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-bold">{symptom.title}</div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {symptom.desc}
                        </p>

                        {/* Special Toggle for Port Damage on BYOD */}
                        {symptom.hasPortDamageToggle && isSelected && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs"
                          >
                            <input
                              type="checkbox"
                              id="portDamagedToggle"
                              checked={portDamaged}
                              onChange={(e) => setPortDamaged(e.target.checked)}
                              className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                            />
                            <label
                              htmlFor="portDamagedToggle"
                              className="cursor-pointer font-medium text-foreground select-none flex items-center gap-1.5"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                              Laptop port mechanically loose / degraded (Bypass via 4K Wireless HDMI Kit)
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Triage Recommendation & Pass (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {!reservation ? (
            <div className="p-6 rounded-2xl border border-border bg-card shadow-lg space-y-6 sticky top-24">
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-primary">
                  Diagnostic Resolution Engine
                </div>
                <h3 className="text-lg font-bold">Recommended Hardware</h3>
                <p className="text-xs text-muted-foreground">
                  Zero-Trust cybersecurity whitelisting automatically enforces verified USB VID/PID and WPC/BIS certification.
                </p>
              </div>

              {/* Hardware Preview Card */}
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <ShieldCheck className="w-4 h-4" /> 100% Whitelisted Asset
                </div>
                <div className="text-base font-extrabold text-foreground">
                  {selectedSymptom === "SYMPTOM_NO_DISPLAY_BYOD" && portDamaged
                    ? "Enterprise 4K Wireless HDMI Transmitter & Receiver Kit"
                    : SYMPTOMS.find((s) => s.code === selectedSymptom)
                        ?.recommendedSku}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Solenoid lock status: Auto-Release</div>
                  <div>• Floor proximity: {activeRoom?.floor === 3 ? "Floor 4 Hub (Nearest fallback)" : `Floor ${activeRoom?.floor} Hub`}</div>
                  <div>• ITSM Ticket: Auto-generates ServiceNow Incident</div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleReserve}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  "Reserving Nearest Locker..."
                ) : (
                  <>
                    <span>Reserve & Generate 6-Digit PIN</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Interactive Pickup Pass Card */
            <div className="p-6 rounded-2xl border-2 border-primary bg-card shadow-2xl space-y-6 sticky top-24 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Locker Reserved
                </div>
                <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> TTL: {timeLeft}
                </div>
              </div>

              {/* Locker Location & Bay */}
              <div className="text-center space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                  {reservation.locker.name}
                </div>
                <div className="text-3xl font-black text-primary tracking-tight">
                  BAY #{reservation.locker.compartmentNumber}
                </div>
                <div className="text-xs text-muted-foreground">
                  Floor {reservation.locker.floor} East Wing Corridor
                </div>
              </div>

              {/* 6-Digit OTP */}
              <div className="p-5 rounded-xl border border-primary/40 bg-primary/10 text-center space-y-2 relative group">
                <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-primary" /> Kiosk One-Time Access PIN
                </div>
                <div className="text-4xl font-mono font-black tracking-widest text-foreground select-all">
                  {reservation.accessPin}
                </div>
                <button
                  onClick={copyPin}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-card border border-border hover:bg-secondary text-muted-foreground transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy PIN
                    </>
                  )}
                </button>
              </div>

              {/* Hardware & ITSM Meta */}
              <div className="text-xs text-muted-foreground space-y-1.5 p-3 rounded-lg bg-secondary/40 border border-border">
                <div className="flex justify-between">
                  <span>Hardware Asset:</span>
                  <span className="font-semibold text-foreground">
                    {reservation.allocatedAsset.skuName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Serial Number:</span>
                  <span className="font-mono text-foreground">
                    {reservation.allocatedAsset.serialNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>ITSM Ticket:</span>
                  <span className="font-mono text-primary font-bold">
                    {reservation.itsmTicketNumber}
                  </span>
                </div>
              </div>

              {/* Direct Link to Kiosk Simulator */}
              <button
                onClick={() =>
                  router.push(
                    `/kiosk-simulator?locker=${reservation.locker.id}&bay=${reservation.locker.compartmentNumber}&pin=${reservation.accessPin}`
                  )
                }
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Simulate Pickup in Locker Kiosk</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RequestPortalPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading Diagnostic Portal...</div>}>
      <RequestPortalContent />
    </Suspense>
  );
}
