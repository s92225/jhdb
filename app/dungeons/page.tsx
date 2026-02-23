import fs from "fs";
import path from "path";
import Link from "next/link";
import EmptyState from "@/app/components/EmptyState";
import { Badge } from "@/app/components/Badge";






type IntegratedDungeon = {
  id: string;
  name: string;
  positioning?: {
    type?: string;
    stage?: string;
    features?: string;
  };
  entry?: {
    location?: string;
    npc?: string;
    method?: string;
    needsItem?: boolean;
    kickOutOnFailure?: boolean;
  };
  recommendedStrength?: {
    stage?: string;
    config?: string;
  };
  workflow?: string[];
  bosses?: string[];
  mechanics?: string[];
  loot?: string[];
  resetPolicy?: string;
  notes?: string;
};

type IntegratedRoot = {
  schemaVersion?: number;
  generatedAt?: string;
  notes?: string[];
  dungeons?: IntegratedDungeon[];
};

function readIntegratedDungeons(): IntegratedDungeon[] {
  const p = path.join(process.cwd(), "data", "dungeons_integrated.json");
  if (!fs.existsSync(p)) return [];

  const raw = fs.readFileSync(p, "utf-8").trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as IntegratedRoot | IntegratedDungeon[];
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray((parsed as IntegratedRoot)?.dungeons)) return (parsed as IntegratedRoot).dungeons!;
    return [];
  } catch (e) {
    console.error("[dungeons] failed to parse dungeons_integrated.json:", e);
    return [];
  }
}

function nonEmpty(s?: string) {
  return typeof s === "string" && s.trim().length > 0;
}

function yesNoUnknown(v?: boolean) {
  if (v === true) return "是";
  if (v === false) return "否";
  return "—";
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-white p-4">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-sm text-slate-700">{children}</div>
    </section>
  );
}

function KV({ k, v }: { k: string; v?: string }) {
  return (
    <div className="flex gap-2">
      <div className="w-20 shrink-0 text-slate-500">{k}</div>
      <div className="min-w-0 text-slate-900">{nonEmpty(v) ? v : "—"}</div>
    </div>
  );
}

export default async function DungeonsPage() {
  const dungeons = readIntegratedDungeons();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header — align with the rest of the site */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">副本攻略</h1>
        <p className="mt-2 text-sm text-slate-600">
          整理版副本資訊（入口、推薦強度、流程、掉落）。缺漏欄位以「—」顯示。
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <Badge className="bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200 border-none">
            共 {Array.isArray(dungeons) ? dungeons.length : 0} 筆
          </Badge>
          <Link className="text-blue-600 hover:underline" href="/quests">
            前往任務流程
          </Link>
        </div>
      </div>

      {Array.isArray(dungeons) && dungeons.length > 0 ? (
        <div className="space-y-4">
          {dungeons.map((d, idx) => {
            const pos = d.positioning ?? {};
            const entry = d.entry ?? {};
            const strength = d.recommendedStrength ?? {};
            const workflow = Array.isArray(d.workflow) ? d.workflow : [];
            const bosses = Array.isArray(d.bosses) ? d.bosses : [];
            const mechanics = Array.isArray(d.mechanics) ? d.mechanics : [];
            const loot = Array.isArray(d.loot) ? d.loot : [];

            return (
              <details
                id={d.id ? String(d.id) : undefined}
                key={d.id || `${d.name}-${idx}`}
                className="rounded-xl border bg-white shadow-sm"
                open={idx < 2}
              >
                <summary className="cursor-pointer list-none px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-lg font-semibold text-slate-900" title={d.name}>
                          {d.name || "（未命名副本）"}
                        </div>

                        {nonEmpty(pos.stage) ? (
                          <Badge className="bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 border-none">
                            {pos.stage}
                          </Badge>
                        ) : null}

                        {nonEmpty(pos.type) ? (
                          <Badge className="bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200 border-none">
                            {pos.type}
                          </Badge>
                        ) : null}
                      </div>

                      <div className="mt-1 text-sm text-slate-600">
                        入口：{nonEmpty(entry.location) ? entry.location : "—"}
                        {nonEmpty(entry.npc) ? ` · ${entry.npc}` : ""}
                        {nonEmpty(entry.method) ? ` · ${entry.method}` : ""}
                      </div>
                    </div>

                    <div className="shrink-0 text-xs text-slate-400 font-mono">
                      {d.id || ""}
                    </div>
                  </div>
                </summary>

                <div className="px-5 pb-5">
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <Section title="副本定位">
                      <div className="space-y-2">
                        <KV k="類型" v={pos.type} />
                        <KV k="階段" v={pos.stage} />
                        <KV k="特性" v={pos.features} />
                      </div>
                    </Section>

                    <Section title="入口方式">
                      <div className="space-y-2">
                        <KV k="地點" v={entry.location} />
                        <KV k="NPC" v={entry.npc} />
                        <KV k="方式" v={entry.method} />
                        <div className="flex gap-2">
                          <div className="w-20 shrink-0 text-slate-500">需道具</div>
                          <div className="text-slate-900">{yesNoUnknown(entry.needsItem)}</div>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-20 shrink-0 text-slate-500">失敗踢出</div>
                          <div className="text-slate-900">{yesNoUnknown(entry.kickOutOnFailure)}</div>
                        </div>
                      </div>
                    </Section>

                    <Section title="推薦強度">
                      <div className="space-y-2">
                        <KV k="階段" v={strength.stage} />
                        <KV k="配置" v={strength.config} />
                      </div>
                    </Section>

                    <Section title="副本流程">
                      {workflow.length > 0 ? (
                        <ol className="list-decimal space-y-1 pl-5">
                          {workflow.map((w, i) => (
                            <li key={i} className="whitespace-pre-wrap">
                              {w}
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <div className="text-slate-500">—</div>
                      )}
                    </Section>

                    <Section title="BOSS">
                      {bosses.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {bosses.map((b, i) => (
                            <Badge
                              key={i}
                              className="bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200 border-none"
                            >
                              {b}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-500">—</div>
                      )}
                    </Section>

                    <Section title="關鍵機制">
                      {mechanics.length > 0 ? (
                        <ul className="list-disc space-y-1 pl-5">
                          {mechanics.map((m, i) => (
                            <li key={i} className="whitespace-pre-wrap">
                              {m}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-slate-500">—</div>
                      )}
                    </Section>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <Section title="主要掉落">
                      {loot.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {loot.map((l, i) => (
                            <Badge
                              key={i}
                              className="bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200 border-none"
                            >
                              {l}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-500">—</div>
                      )}
                    </Section>

                    <Section title="次數與重刷">
                      <div className="text-slate-900">{nonEmpty(d.resetPolicy) ? d.resetPolicy : "—"}</div>
                    </Section>
                  </div>

                  {nonEmpty(d.notes) ? (
                    <div className="mt-3 rounded-lg border bg-slate-50 p-4">
                      <div className="text-sm font-semibold text-slate-900">小筆記</div>
                      <div className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{d.notes}</div>
                    </div>
                  ) : null}

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <Link className="text-blue-600 hover:underline" href="/quests">
                      回到任務流程
                    </Link>
                    <span className="text-slate-400">點標題可收合/展開</span>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="目前沒有副本資料"
          description="請確認 data/dungeons_integrated.json 已存在且格式正確。"
        />
      )}
    </div>
  );
}
