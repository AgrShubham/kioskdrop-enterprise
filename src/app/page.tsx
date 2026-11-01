import Link from "next/link";
import { ShieldCheck, Cpu, Smartphone, BarChart3, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 sm:p-12 overflow-hidden bg-gradient-to-b from-background via-background to-primary/5">
      {/* Top Ambient Spotlight Aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[450px] bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.18),transparent_65%)] blur-2xl"
      />

      <div className="relative z-10 max-w-5xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase shadow-sm dark:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <ShieldCheck className="w-4 h-4" /> Zero-Trust AV Micro-Logistics Platform
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          KioskDrop <span className="text-primary bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500 bg-clip-text text-transparent">Enterprise</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Automated conference room AV hardware smart-locker network. Solving last-meter meeting room equipment failures with zero-trust asset whitelisting and real-time telemetry.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-8 text-left">
          <Link
            href="/request?room=Boardroom-4B&floor=4"
            className="group relative p-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md hover:border-primary/60 transition-all duration-300 shadow-sm hover:shadow-xl dark:hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)] hover:-translate-y-1 flex flex-col justify-between glass-chamfer"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300">
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
            className="group relative p-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md hover:border-primary/60 transition-all duration-300 shadow-sm hover:shadow-xl dark:hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)] hover:-translate-y-1 flex flex-col justify-between glass-chamfer"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300">
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
            className="group relative p-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md hover:border-primary/60 transition-all duration-300 shadow-sm hover:shadow-xl dark:hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)] hover:-translate-y-1 flex flex-col justify-between glass-chamfer"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300">
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
