"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Coins,
  BarChart3,
  Radio,
  Building2,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Calculator,
  RefreshCw,
  Search,
  ExternalLink,
  Lock,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { useTelemetry } from "@/hooks/useTelemetry";

export default function AdminCommandCenter() {
  const [activeTab, setActiveTab] = useState<
    "COMPLIANCE" | "FINOPS" | "ANALYTICS" | "WEBHOOKS"
  >("COMPLIANCE");
  const [session, setSession] = useState<any>(null);

  // Compliance state
  const [assets, setAssets] = useState<any[]>([]);
  const [tariffRates, setTariffRates] = useState<any[]>([]);

  // Landed cost calculator state
  const [calcCifINR, setCalcCifINR] = useState<number>(34000);
  const [calcHsn, setCalcHsn] = useState<string>("85437099");
  const [calcMode, setCalcMode] = useState<"DIRECT_IMPORT" | "DOMESTIC_WHOLESALE">("DIRECT_IMPORT");
  const [calcResult, setCalcResult] = useState<any>(null);

  // FinOps state
  const [transactions, setTransactions] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [skus, setSkus] = useState<any[]>([]);
  const [totalSavingsPaise, setTotalSavingsPaise] = useState<number>(0);

  // Restock form state
  const [selectedSkuId, setSelectedSkuId] = useState<string>("");
  const [restockQty, setRestockQty] = useState<number>(5);
  const [restockCard, setRestockCard] = useState<string>("ZAGGLE_CARD");
  const [restockErp, setRestockErp] = useState<string>("SAP_S4HANA");
  const [restockMessage, setRestockMessage] = useState<string | null>(null);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Webhooks state
  const [webhookEvents, setWebhookEvents] = useState<any[]>([]);
  const [replayingId, setReplayingId] = useState<string | null>(null);

  // Initial load
  const loadData = useCallback(() => {
    fetch("/api/session/current")
      .then((res) => res.json())
      .then((d) => setSession(d.session))
      .catch(() => {});

    fetch("/api/admin/compliance")
      .then((res) => res.json())
      .then((d) => {
        if (d.assets) setAssets(d.assets);
        if (d.tariffRates) setTariffRates(d.tariffRates);
      })
      .catch(() => {});

    fetch("/api/admin/finops")
      .then((res) => res.json())
      .then((d) => {
        if (d.transactions) setTransactions(d.transactions);
        if (d.purchaseOrders) setPurchaseOrders(d.purchaseOrders);
        if (d.skus) {
          setSkus(d.skus);
          setSelectedSkuId((prev) => prev || (d.skus.length > 0 ? d.skus[0].id : ""));
        }
        if (d.totalSavingsPaise) setTotalSavingsPaise(d.totalSavingsPaise);
      })
      .catch(() => {});

    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((d) => {
        if (d.floorMetrics) setAnalyticsData(d);
      })
      .catch(() => {});

    fetch("/api/admin/webhooks")
      .then((res) => res.json())
      .then((d) => {
        if (d.events) setWebhookEvents(d.events);
      })
      .catch(() => {});
  }, []);

  const calculateTariff = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/compliance/landed-cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cifAmountINR: calcCifINR,
          hsnCode: calcHsn,
          procurementMode: calcMode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCalcResult(data);
      }
    } catch {
      // Calc failed
    }
  }, [calcCifINR, calcHsn, calcMode]);

  useEffect(() => {
    loadData();
    calculateTariff();
  }, [loadData, calculateTariff]);

  useTelemetry(() => {
    loadData();
  });

  const handleToggleWhitelist = async (assetId: string, current: boolean) => {
    try {
      const res = await fetch("/api/admin/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, hidWhitelisted: !current }),
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } catch {
      // Toggle failed
    }
  };

  const handleReplenish = async () => {
    if (!selectedSkuId) return;
    setRestockMessage(null);

    try {
      const res = await fetch("/api/admin/finops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skuId: selectedSkuId,
          quantity: restockQty,
          cardProvider: restockCard,
          erpTarget: restockErp,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRestockMessage(data.message);
        loadData();
      }
    } catch {
      setRestockMessage("Replenishment request failed.");
    }
  };

  const handleReplayWebhook = async (id: string) => {
    setReplayingId(id);
    try {
      const res = await fetch("/api/admin/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookEventId: id }),
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } finally {
      setReplayingId(null);
    }
  };

  const switchPersona = async (role: "IT_ADMIN" | "FINOPS_AUDITOR") => {
    await fetch("/api/session/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    window.location.reload();
  };

  // RBAC Banner for Employees
  const isEmployee = session?.role === "EMPLOYEE";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Title & Persona State */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
            <Building2 className="w-3.5 h-3.5" /> Enterprise ITAM & FinOps Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Security, Compliance & FinOps Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Zero-Trust USB endpoint whitelisting, statutory Indian HSN landed-cost engine, and consumption anomaly detection.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-card border border-border">
          {[
            { id: "COMPLIANCE", label: "Zero-Trust & Landed Cost", icon: ShieldCheck },
            { id: "FINOPS", label: "FinOps & Restocking", icon: Coins },
            { id: "ANALYTICS", label: "360° Telemetry & Anomalies", icon: BarChart3 },
            { id: "WEBHOOKS", label: "ITSM Webhooks", icon: Radio },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RBAC Warning Banner if logged in as Employee */}
      {isEmployee && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              You are currently viewing as <strong>Aarav Sharma (EMPLOYEE)</strong>. Some administrative write controls are restricted by server-side RBAC.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => switchPersona("IT_ADMIN")}
              className="px-3 py-1 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Switch to IT Admin (Priya Patel)
            </button>
            <button
              onClick={() => switchPersona("FINOPS_AUDITOR")}
              className="px-3 py-1 rounded-lg bg-secondary text-foreground font-bold text-xs hover:bg-secondary/80 transition-colors border border-border cursor-pointer"
            >
              Switch to FinOps (Vikram)
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: ZERO-TRUST COMPLIANCE & STATUTORY TARIFF CALCULATOR */}
      {activeTab === "COMPLIANCE" && (
        <div className="space-y-8">
          {/* Top Half: Interactive Statutory Landed-Cost Calculator */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary">
                  Indian Customs Tariff Engine (ADR D6)
                </div>
                <h2 className="text-lg font-bold">Statutory Landed-Cost & Duty Stack Calculator</h2>
              </div>
              <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full font-mono">
                Formula: Va(1.01) + BCD(20%) + SWS(2%) + IGST(21.96% Va / 22.18% CIF) = 44.40%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    CIF Purchase Value (INR)
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-bold">₹</span>
                    <input
                      type="number"
                      value={calcCifINR}
                      onChange={(e) => setCalcCifINR(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-secondary/80 border border-border text-foreground font-mono text-sm focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    HSN Tariff Classification
                  </label>
                  <select
                    value={calcHsn}
                    onChange={(e) => setCalcHsn(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-secondary/80 border border-border text-foreground text-xs"
                  >
                    <option value="85437099">85437099 - Converters & BLE Clickers (20% BCD + 18% IGST)</option>
                    <option value="85182210">85182210 - Wireless HDMI & Audio Kits (20% BCD + 18% IGST)</option>
                    <option value="85444299">85444299 - High-Speed Display Cables (20% BCD + 18% IGST)</option>
                    <option value="85181000">85181000 - Directional Microphones (20% BCD + 18% IGST)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Procurement Channel
                  </label>
                  <select
                    value={calcMode}
                    onChange={(e) => setCalcMode(e.target.value as any)}
                    className="w-full mt-1 p-2 rounded-xl bg-secondary/80 border border-border text-foreground text-xs"
                  >
                    <option value="DIRECT_IMPORT">Direct Import (Incurs Customs BCD + SWS + IGST)</option>
                    <option value="DOMESTIC_WHOLESALE">Domestic Wholesale (Incurs Domestic GST only)</option>
                  </select>
                </div>

                <button
                  onClick={calculateTariff}
                  className="w-full py-2.5 px-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Calculator className="w-4 h-4" /> Compute Statutory Breakdown
                </button>
              </div>

              {/* Calculated Outputs (2 cols) */}
              <div className="md:col-span-2 p-5 rounded-xl bg-secondary/40 border border-border space-y-4">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Duty Stack & Tax Breakdown ({calcMode.replace(/_/g, " ")})
                </div>

                {calcResult && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-card border border-border">
                      <div className="text-[10px] text-muted-foreground uppercase">Base CIF</div>
                      <div className="text-base font-bold font-mono text-foreground mt-0.5">
                        {calcResult.formatted.cifINR}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-card border border-border">
                      <div className="text-[10px] text-muted-foreground uppercase">Assessable Base (Va)</div>
                      <div className="text-base font-bold font-mono text-foreground mt-0.5">
                        {calcResult.formatted.assessableValueINR}
                      </div>
                      <div className="text-[9px] text-muted-foreground">+1% Landing Charge</div>
                    </div>

                    <div className="p-3 rounded-lg bg-card border border-border">
                      <div className="text-[10px] text-muted-foreground uppercase">Total Customs Duty</div>
                      <div className="text-base font-bold font-mono text-primary mt-0.5">
                        {calcResult.formatted.totalDutiesINR}
                      </div>
                      <div className="text-[9px] text-primary">{calcResult.effectiveDutyRatePercent}% of CIF</div>
                    </div>

                    <div className="p-3 rounded-lg bg-card border border-border">
                      <div className="text-[10px] text-muted-foreground uppercase">Total Landed Cost</div>
                      <div className="text-base font-bold font-mono text-foreground mt-0.5">
                        {calcResult.formatted.totalLandedCostINR}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-components breakdown */}
                {calcResult && calcMode === "DIRECT_IMPORT" && (
                  <div className="p-3 rounded-lg bg-card border border-border text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between text-muted-foreground">
                      <span>• Basic Customs Duty (BCD 20%):</span>
                      <span className="text-foreground">{calcResult.formatted.bcdINR}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>• Social Welfare Surcharge (SWS 10% of BCD = 2%):</span>
                      <span className="text-foreground">{calcResult.formatted.swsINR}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>• Integrated Goods & Services Tax (IGST 18%):</span>
                      <span className="text-foreground">{calcResult.formatted.igstINR}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1 font-bold text-emerald-400">
                      <span>Effective Cost Net of Recoverable ITC (CIF + BCD + SWS):</span>
                      <span>{calcResult.formatted.netCostAfterItcINR}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Half: Endpoint Cybersecurity Whitelist Manager */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary">
                  Zero-Trust Asset Registry
                </div>
                <h2 className="text-lg font-bold">Cryptographic VID/PID & Regulatory Whitelist</h2>
              </div>
              <span className="text-xs text-muted-foreground">
                Total Tracked Units: {assets.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2.5 px-3">Serial Number</th>
                    <th className="py-2.5 px-3">Hardware SKU</th>
                    <th className="py-2.5 px-3">USB Vendor ID</th>
                    <th className="py-2.5 px-3">USB Product ID</th>
                    <th className="py-2.5 px-3">WPC ETA / BIS CRS</th>
                    <th className="py-2.5 px-3">Current Location</th>
                    <th className="py-2.5 px-3">Condition</th>
                    <th className="py-2.5 px-3 text-right">HID Whitelist</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {assets.map((asset) => {
                    const isWhitelisted = asset.hidWhitelisted;
                    return (
                      <tr key={asset.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold">{asset.serialNumber}</td>
                        <td className="py-3 px-3">{asset.sku.name}</td>
                        <td className="py-3 px-3 font-mono text-muted-foreground">{asset.usbVendorId}</td>
                        <td className="py-3 px-3 font-mono text-muted-foreground">{asset.usbProductId}</td>
                        <td className="py-3 px-3 font-mono text-[11px]">
                          {asset.sku.wpcEtaCertNumber ? (
                            <span className="text-emerald-400">{asset.sku.wpcEtaCertNumber}</span>
                          ) : (
                            <span className="text-muted-foreground">N/A (Cabled)</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">
                          {asset.compartment
                            ? `${asset.compartment.locker.name} Bay #${asset.compartment.compartmentNumber}`
                            : asset.availability}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              asset.condition === "HEALTHY"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {asset.condition}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleToggleWhitelist(asset.id, isWhitelisted)}
                            disabled={isEmployee}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                              isWhitelisted
                                ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                : "bg-destructive/20 text-destructive hover:bg-destructive/30"
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                          >
                            {isWhitelisted ? "WHITELISTED" : "BLOCKED"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FINOPS & RESTOCKING */}
      {activeTab === "FINOPS" && (
        <div className="space-y-8">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-1">
              <div className="text-xs font-bold text-muted-foreground uppercase">Total Wholesale Savings</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                ₹{(totalSavingsPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-muted-foreground">B2B procurement vs emergency courier retail</div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-1">
              <div className="text-xs font-bold text-muted-foreground uppercase">Zaggle/Happay Card Limits</div>
              <div className="text-2xl font-black text-foreground font-mono">₹1,00,000 / mo</div>
              <div className="text-[11px] text-muted-foreground">Locked to Merchant Category Code MCC 5045</div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-1">
              <div className="text-xs font-bold text-muted-foreground uppercase">ERP Sync Status</div>
              <div className="text-2xl font-black text-primary font-mono">100% RECONCILED</div>
              <div className="text-[11px] text-muted-foreground">SAP S/4HANA & Zoho Books auto-posting</div>
            </div>
          </div>

          {/* Replenishment Order Form & Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Restock Form */}
            <div className="lg:col-span-4 p-6 rounded-2xl border border-border bg-card shadow-md space-y-4">
              <div className="border-b border-border pb-3">
                <div className="text-xs font-bold uppercase tracking-wider text-primary">
                  B2B Replenishment Engine
                </div>
                <h3 className="text-base font-bold">Trigger Automated Restock</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Hardware SKU</label>
                  <select
                    value={selectedSkuId}
                    onChange={(e) => setSelectedSkuId(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-secondary/80 border border-border text-foreground text-xs"
                  >
                    {skus.map((sku) => (
                      <option key={sku.id} value={sku.id}>
                        {sku.name} (₹{sku.wholesalePricePaise / 100})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={restockQty}
                    onChange={(e) => setRestockQty(Number(e.target.value))}
                    className="w-full mt-1 p-2 rounded-xl bg-secondary/80 border border-border text-foreground text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Corporate Card Provider</label>
                  <select
                    value={restockCard}
                    onChange={(e) => setRestockCard(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-secondary/80 border border-border text-foreground text-xs"
                  >
                    <option value="ZAGGLE_CARD">Zaggle Corporate Prepaid (MCC 5045)</option>
                    <option value="HAPPAY_PETTY_CASH">Happay Digital Petty Cash</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Target ERP System</label>
                  <select
                    value={restockErp}
                    onChange={(e) => setRestockErp(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-secondary/80 border border-border text-foreground text-xs"
                  >
                    <option value="SAP_S4HANA">SAP S/4HANA (BAPI / IDoc)</option>
                    <option value="ORACLE_NETSUITE">Oracle NetSuite</option>
                    <option value="ZOHO_BOOKS">Zoho Books GST Integration</option>
                  </select>
                </div>

                {restockMessage && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                    {restockMessage}
                  </div>
                )}

                <button
                  onClick={handleReplenish}
                  disabled={isEmployee}
                  className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  Authorize Purchase Order
                </button>
              </div>
            </div>

            {/* Right: Transactions Ledger */}
            <div className="lg:col-span-8 p-6 rounded-2xl border border-border bg-card shadow-md space-y-4">
              <div className="border-b border-border pb-3">
                <div className="text-xs font-bold uppercase tracking-wider text-primary">
                  Reconciliation Ledger
                </div>
                <h3 className="text-base font-bold">Zaggle & Happay Transaction Stream</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Provider</th>
                      <th className="py-2 px-3">Vendor</th>
                      <th className="py-2 px-3">Invoice # (CGST)</th>
                      <th className="py-2 px-3">Amount</th>
                      <th className="py-2 px-3">ERP Sync</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="py-2.5 px-3 text-muted-foreground font-mono">
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 font-semibold">{txn.provider.replace(/_/g, " ")}</td>
                        <td className="py-2.5 px-3">{txn.vendorName}</td>
                        <td className="py-2.5 px-3 font-mono text-muted-foreground">{txn.gstInvoiceNumber}</td>
                        <td className="py-2.5 px-3 font-mono font-bold">
                          ₹{(txn.amountPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                            {txn.erpSyncTarget} • {txn.erpSyncStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ITAM 360° TELEMETRY & ANOMALY DETECTION */}
      {activeTab === "ANALYTICS" && (
        <div className="space-y-8">
          {/* Anomaly Detection Banner */}
          {analyticsData?.anomalyAlerts && analyticsData.anomalyAlerts.length > 0 ? (
            <div className="space-y-3">
              {analyticsData.anomalyAlerts.map((alert: any) => (
                <div
                  key={alert.roomId}
                  className="p-5 rounded-2xl border-2 border-destructive bg-destructive/10 text-destructive shadow-lg flex items-start gap-4 animate-in fade-in duration-200"
                >
                  <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5 text-destructive" />
                  <div className="space-y-1">
                    <div className="text-sm font-black uppercase tracking-wider">
                      ⚠️ Consumption Anomaly Detected: {alert.roomName} (Floor {alert.floor})
                    </div>
                    <p className="text-xs text-foreground/90 leading-relaxed">
                      {alert.roomName} has consumed <strong>{alert.unreturnedCount14Days} hardware adapters</strong> in the past 14 days without return.
                    </p>
                    <div className="text-xs font-semibold text-destructive mt-1">
                      Actionable Recommendation: {alert.recommendation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> All conference rooms within normal consumption loss thresholds (&lt;4 adapters in 14 days).
            </div>
          )}

          {/* Tower Floorplan Map & Locker Occupancy */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-lg space-y-4">
            <div className="border-b border-border pb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-primary">
                Corporate Tower Topography
              </div>
              <h2 className="text-lg font-bold">Floor Locker Live Occupancy & Telemetry</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analyticsData?.floorMetrics?.map((metric: any) => (
                <div
                  key={metric.lockerId}
                  className="p-5 rounded-xl border border-border bg-secondary/30 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-base font-extrabold">{metric.lockerName}</div>
                      <div className="text-xs text-muted-foreground">Floor {metric.floor} • Temp: {metric.temperatureC}°C</div>
                    </div>
                    <div className="text-2xl font-black font-mono text-primary">
                      {metric.occupancyRatePercent}%
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-secondary rounded-full h-3 overflow-hidden border border-border">
                    <div
                      className="bg-primary h-full transition-all duration-500"
                      style={{ width: `${metric.occupancyRatePercent}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-card border border-border">
                      <div className="text-[10px] text-muted-foreground">Occupied</div>
                      <div className="font-bold text-foreground">{metric.occupiedBays}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-card border border-border">
                      <div className="text-[10px] text-muted-foreground">Checked Out</div>
                      <div className="font-bold text-sky-400">{metric.checkedOutBays}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-card border border-border">
                      <div className="text-[10px] text-muted-foreground">Quarantine</div>
                      <div className="font-bold text-destructive">{metric.quarantinedBays}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recharts Financial Comparison */}
          {analyticsData?.consumptionTrends && (
            <div className="p-6 rounded-2xl border border-border bg-card shadow-lg space-y-4">
              <div className="border-b border-border pb-3">
                <div className="text-xs font-bold uppercase tracking-wider text-primary">
                  Procurement Economics
                </div>
                <h2 className="text-lg font-bold">Wholesale vs. Retail Replacement Avoided (INR)</h2>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.consumptionTrends}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                    <YAxis stroke="#888888" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip
                      formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, ""]}
                      contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px" }}
                    />
                    <Legend />
                    <Bar dataKey="wholesaleINR" name="Wholesale B2B Cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="retailAvoidedINR" name="Retail Avoided" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="savingsINR" name="Net Enterprise Savings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ITSM WEBHOOK MONITOR */}
      {activeTab === "WEBHOOKS" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-border bg-card shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary">
                  ITSM Integration Monitor
                </div>
                <h2 className="text-lg font-bold">ServiceNow & Zendesk Webhook Events</h2>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                Endpoints: /api/webhooks/servicenow • /api/webhooks/zendesk
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Source</th>
                    <th className="py-2.5 px-3">Direction</th>
                    <th className="py-2.5 px-3">Latency</th>
                    <th className="py-2.5 px-3">Signature</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {webhookEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-3 font-mono text-muted-foreground">
                        {new Date(evt.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-3 font-bold">{evt.source}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-foreground">
                          {evt.direction}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">{evt.latencyMs}ms</td>
                      <td className="py-3 px-3">
                        <span className="text-emerald-400 font-bold">HMAC VALID</span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            evt.status === "SUCCESS"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : evt.status === "REPLAYED"
                              ? "bg-sky-500/10 text-sky-400"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {evt.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleReplayWebhook(evt.id)}
                          disabled={replayingId === evt.id || isEmployee}
                          className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-bold text-[10px] transition-colors border border-border cursor-pointer disabled:opacity-40"
                        >
                          {replayingId === evt.id ? "Replaying..." : "Replay"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
