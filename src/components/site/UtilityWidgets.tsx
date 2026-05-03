import { Cloud, DollarSign, Coins, TrendingUp, TrendingDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function UtilityWidgets() {
  const { t, lang } = useI18n();

  const cities = [
    { name: { en: "Riyadh", ar: "الرياض", fr: "Riyad" }, temp: 38, cond: "☀️" },
    { name: { en: "Dubai", ar: "دبي", fr: "Dubaï" }, temp: 36, cond: "☀️" },
    { name: { en: "Cairo", ar: "القاهرة", fr: "Le Caire" }, temp: 31, cond: "⛅" },
    { name: { en: "Paris", ar: "باريس", fr: "Paris" }, temp: 17, cond: "🌧️" },
  ];
  const fx = [
    { pair: "USD/AED", value: "3.6725", change: 0.01 },
    { pair: "EUR/SAR", value: "4.0183", change: 0.18 },
    { pair: "USD/EGP", value: "48.62", change: -0.24 },
  ];
  const gold = [
    { kind: "XAU/USD", value: "2,418.50", change: 0.62 },
    { kind: "24K", value: "78.42", change: 0.34 },
    { kind: "22K", value: "71.89", change: 0.31 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Widget icon={<Cloud className="h-4 w-4" />} title={t("widget.weather")} accent="from-sky-500 to-blue-600">
        <ul className="space-y-2.5 text-sm">
          {cities.map((c, i) => (
            <li key={i} className="flex items-center justify-between">
              <span className="font-medium">{c.name[lang]}</span>
              <span className="inline-flex items-center gap-1.5">
                <span>{c.cond}</span>
                <span className="font-mono font-bold">{c.temp}°</span>
              </span>
            </li>
          ))}
        </ul>
      </Widget>

      <Widget icon={<DollarSign className="h-4 w-4" />} title={t("widget.currency")} accent="from-emerald-500 to-teal-600">
        <ul className="space-y-2.5 text-sm">
          {fx.map((f, i) => (
            <li key={i} className="flex items-center justify-between">
              <span className="font-mono font-medium">{f.pair}</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="font-mono">{f.value}</span>
                <Trend value={f.change} />
              </span>
            </li>
          ))}
        </ul>
      </Widget>

      <Widget icon={<Coins className="h-4 w-4" />} title={t("widget.gold")} accent="from-amber-500 to-orange-600">
        <ul className="space-y-2.5 text-sm">
          {gold.map((g, i) => (
            <li key={i} className="flex items-center justify-between">
              <span className="font-medium">{g.kind} <span className="text-xs text-muted-foreground">/ {g.kind === "XAU/USD" ? "oz" : "g"}</span></span>
              <span className="inline-flex items-center gap-1.5">
                <span className="font-mono">${g.value}</span>
                <Trend value={g.change} />
              </span>
            </li>
          ))}
        </ul>
      </Widget>
    </div>
  );
}

function Widget({ icon, title, accent, children }: { icon: React.ReactNode; title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="card-lift overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <div className={`flex items-center gap-2 bg-gradient-to-r ${accent} px-4 py-2.5 text-white`}>
        {icon}
        <h3 className="text-sm font-bold uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Trend({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${up ? "text-emerald-600" : "text-rose-600"}`}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? "+" : ""}{value.toFixed(2)}%
    </span>
  );
}
