import Link from "next/link";
import { ShieldCheck, Cpu, Smartphone, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-background via-background to-secondary/20">
      <div className="max-w-4xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
          <ShieldCheck className="w-3.5 h-3.5" /> Zero-Trust AV Micro-Logistics Platform
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          KioskDrop <span className="text-primary">Enterprise</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Automated conference room AV hardware smart-locker network. Solving last-meter meeting room equipment failures with zero-trust asset whitelisting and real-time telemetry.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left">
          <Link
            href="/request?room=Boardroom-4B&floor=4"
            className="group p-6 rounded-xl border border-border bg-card hover:border-primary transition-all shadow-sm hover:shadow-md"
          >
            <Smartphone className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h2 className="text-lg font-bold">Rapid-Drop QR Portal</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Simulate scanning a meeting room QR code, diagnose AV symptoms, and get an instant pickup PIN.
            </p>
          </Link>

          <Link
            href="/kiosk-simulator"
            className="group p-6 rounded-xl border border-border bg-card hover:border-primary transition-all shadow-sm hover:shadow-md"
          >
            <Cpu className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h2 className="text-lg font-bold">IoT Locker Simulator</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Interactive 12-bay floor locker bank with solenoid actuators, IR presence sensors, and RFID badge unlock.
            </p>
          </Link>

          <Link
            href="/admin"
            className="group p-6 rounded-xl border border-border bg-card hover:border-primary transition-all shadow-sm hover:shadow-md"
          >
            <BarChart3 className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h2 className="text-lg font-bold">ITAM & FinOps Command</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Zero-Trust VID/PID whitelist, statutory HSN tariff calculator, Happay/Zaggle ledger, and anomaly detection.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
