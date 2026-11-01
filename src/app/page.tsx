import Link from "next/link";
import { ShieldCheck, Cpu, Smartphone, BarChart3, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 sm:p-12 bg-gradient-to-b from-background via-background to-primary/5">
      <div className="max-w-5xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase shadow-sm">
          <ShieldCheck className="w-4 h-4" /> Zero-Trust AV Micro-Logistics Platform
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          KioskDrop <span className="text-primary">Enterprise</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Automated conference room AV hardware smart-locker network. Solving last-meter meeting room equipment failures with zero-trust asset whitelisting and real-time telemetry.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-8 text-left">
          <Link
            href="/request?room=Boardroom-4B&floor=4"
            className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/60 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <Smartphone className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold group-hover:text-primary transition-colors">Rapid-Drop QR Portal</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Simulate scanning a meeting room QR code, diagnose AV symptoms, and get an instant pickup PIN.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mt-6 pt-4 border-t border-border/50">
              <span>Open Scanner</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/kiosk-simulator"
            className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/60 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <Cpu className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold group-hover:text-primary transition-colors">IoT Locker Simulator</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Interactive 12-bay floor locker bank with solenoid actuators, IR presence sensors, and RFID badge unlock.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mt-6 pt-4 border-t border-border/50">
              <span>Launch Simulator</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin"
            className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/60 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold group-hover:text-primary transition-colors">ITAM & FinOps Command</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Zero-Trust VID/PID whitelist, statutory HSN tariff calculator, Happay/Zaggle ledger, and anomaly detection.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mt-6 pt-4 border-t border-border/50">
              <span>View Analytics</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
