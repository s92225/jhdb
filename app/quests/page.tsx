import Link from "next/link";
import integrated from "@/data/quests_integrated.json";

type IntegratedQuest = {
  id: string;
  title: string;
  category?: string; // 新手/練功/門派...
  tags?: string[];
  summary?: string;

  // 常見欄位（可能有、可能沒有；缺就顯示 —）
  start?: string; // 接取方式/入口/NPC
  requirements?: string; // 門檻
  route?: string; // 路線/流程
  rewards?: string; // 獎勵/掉落
  notes?: string; // 補充

  // 更新區（可選）
  updates?: Array<{
    version?: string;
    text: string;
    source?: string;
  }>;

  // 來源
  source?: string; // 檔名
};

type IntegratedRoot = {
  quests?: IntegratedQuest[];
};

const CATEGORY_ORDER = [
  "新手",
  "練功",
  "門派",
  "刷錢",
  "城市",
  "陣營",
  "轉生後",
  "活動",
  "其他",
] as const;

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function getQuests(): IntegratedQuest[] {
  // 允許 root.quests 或直接 array
  if (Array.isArray(integrated)) return integrated as unknown as IntegratedQuest[];
  const root = integrated as unknown as IntegratedRoot;
  return asArray<IntegratedQuest>(root?.quests);
}

function catIndex(cat?: string) {
  const c = (cat ?? "其他").trim() || "其他";
  const i = CATEGORY_ORDER.indexOf(c as any);
  return i === -1 ? CATEGORY_ORDER.length : i;
}

function badgeClassByCategory(cat?: string) {
  const c = (cat ?? "其他").trim() || "其他";
  switch (c) {
    case "新手":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "練功":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "門派":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "刷錢":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "城市":
      return "bg-slate-50 text-slate-700 border-slate-200";
    case "陣營":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "轉生後":
      return "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200";
    case "活動":
      return "bg-lime-50 text-lime-800 border-lime-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function clean(s?: string) {
  const t = (s ?? "").trim();
  return t || "—";
}

type PageProps = {
  searchParams?: {
    tab?: string;
    view?: string;
    sort?: string;
    q?: string;
  };
};

export default function QuestsPage({ searchParams }: PageProps) {
  const all = getQuests().map((q) => ({
    ...q,
    category: (q.category ?? "其他").trim() || "其他",
    tags: asArray<string>(q.tags),
  }));

  // tabs：只顯示有資料的分類
  const categories = CATEGORY_ORDER.filter((c) => all.some((q) => q.category === c));
  const tabs = ["全部", ...categories];

  const tabQ = (searchParams?.tab ?? "全部").trim();
  const viewQ = (searchParams?.view ?? "table").trim();
  const sortQ = (searchParams?.sort ?? "category").trim();
  const qQ = (searchParams?.q ?? "").trim();

  const selectedTab = tabs.includes(tabQ) ? tabQ : "全部";
  const viewMode: "cards" | "table" = viewQ === "cards" ? "cards" : "table";
  const sortMode: "category" | "title" = sortQ === "title" ? "title" : "category";

  let list = all;

  // filter tab
  if (selectedTab !== "全部") {
    list = list.filter((x) => (x.category ?? "其他") === selectedTab);
  }

  // search
  if (qQ) {
    const needle = qQ.toLowerCase();
    list = list.filter((x) => {
      const hay = [
        x.title,
        x.category,
        ...(x.tags ?? []),
        x.summary,
        x.start,
        x.requirements,
        x.route,
        x.rewards,
        x.notes,
      ]
        .filter(Boolean)
        .join("\n")
        .toLowerCase();
      return hay.includes(needle);
    });
  }

  // sort
  list = [...list].sort((a, b) => {
    if (sortMode === "title") return (a.title ?? "").localeCompare(b.title ?? "", "zh-Hant");
    const ca = catIndex(a.category);
    const cb = catIndex(b.category);
    if (ca !== cb) return ca - cb;
    return (a.title ?? "").localeCompare(b.title ?? "", "zh-Hant");
  });

  // href builder
  const href = (next: Partial<{ tab: string; view: string; sort: string; q: string }>) => {
    const p = new URLSearchParams();
    const t = next.tab ?? selectedTab;
    const v = next.view ?? viewMode;
    const s = next.sort ?? sortMode;
    const qq = next.q ?? qQ;

    if (t && t !== "全部") p.set("tab", t);
    if (v && v !== "table") p.set("view", v);
    if (s && s !== "category") p.set("sort", s);
    if (qq) p.set("q", qq);

    const qs = p.toString();
    return qs ? `/quests?${qs}` : `/quests`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">任務流程</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ✅ 使用整合攻略資料（quests_integrated.json）。缺資料顯示「—」。
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full border bg-gray-50 px-3 py-1 text-xs text-muted-foreground">
            只顯示目前版本資訊
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={href({ view: "cards" })}
              className={`rounded-full border px-3 py-1 text-xs ${
                viewMode === "cards" ? "bg-black text-white border-black" : "bg-white text-gray-700"
              }`}
            >
              卡片
            </Link>
            <Link
              href={href({ view: "table" })}
              className={`rounded-full border px-3 py-1 text-xs ${
                viewMode === "table" ? "bg-black text-white border-black" : "bg-white text-gray-700"
              }`}
            >
              表格
            </Link>

            <Link
              href={href({ sort: "category" })}
              className={`rounded-full border px-3 py-1 text-xs ${
                sortMode === "category" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700"
              }`}
            >
              依分類排序
            </Link>
            <Link
              href={href({ sort: "title" })}
              className={`rounded-full border px-3 py-1 text-xs ${
                sortMode === "title" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700"
              }`}
            >
              依名稱排序
            </Link>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              defaultValue={qQ}
              placeholder="搜尋：任務名 / 分類 / 關鍵字..."
              className="w-full flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                const v = (e.currentTarget.value ?? "").trim();
                window.location.href = href({ q: v });
              }}
            />
            <Link
              href={href({ q: "" })}
              className="rounded-xl border bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              清除
            </Link>
            <span className="rounded-xl border bg-gray-50 px-3 py-2 text-sm text-muted-foreground">
              共 {list.length} 筆
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = t === selectedTab;
          return (
            <Link
              key={t}
              href={href({ tab: t })}
              className={`rounded-full border px-3 py-1 text-sm ${
                active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700"
              }`}
            >
              {t}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-6">{viewMode === "table" ? <QuestTable list={list} /> : <QuestCards list={list} />}</div>
    </div>
  );
}

function QuestCards({ list }: { list: IntegratedQuest[] }) {
  return (
    <div className="space-y-4">
      {list.map((q) => (
        <section key={q.id} className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{q.title}</h2>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] ${badgeClassByCategory(q.category)}`}>
                  {q.category ?? "其他"}
                </span>
              </div>
              {q.summary ? <p className="mt-2 text-sm text-muted-foreground">{q.summary}</p> : null}
            </div>

            {q.source ? <div className="text-xs text-muted-foreground">來源：{q.source}</div> : null}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field label="接取方式 / 入口" text={q.start} />
            <Field label="門檻 / 條件" text={q.requirements} />
            <Field label="流程 / 路線" text={q.route} wide />
            <Field label="獎勵 / 掉落" text={q.rewards} wide />
            <Field label="補充" text={q.notes} wide />
          </div>

          {Array.isArray(q.updates) && q.updates.length ? (
            <details className="mt-4 rounded-xl border bg-gray-50 px-4 py-3">
              <summary className="cursor-pointer text-sm font-medium">更新與調整</summary>
              <div className="mt-2 space-y-2 text-sm text-gray-700">
                {q.updates.map((u, idx) => (
                  <div key={idx} className="rounded-lg border bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs text-muted-foreground">{u.version ? `版本：${u.version}` : "版本：—"}</div>
                      {u.source ? <div className="text-xs text-muted-foreground">來源：{u.source}</div> : null}
                    </div>
                    <div className="mt-2 whitespace-pre-wrap leading-6">{u.text}</div>
                  </div>
                ))}
              </div>
            </details>
          ) : null}
        </section>
      ))}
    </div>
  );
}

function QuestTable({ list }: { list: IntegratedQuest[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-muted-foreground">
            <tr className="[&>th]:px-4 [&>th]:py-3">
              <th className="w-[120px]">分類</th>
              <th className="w-[220px]">任務</th>
              <th>接取方式</th>
              <th>門檻</th>
              <th>獎勵</th>
              <th className="w-[80px] text-right">更新</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {list.map((q) => (
              <tr key={q.id} className="[&>td]:px-4 [&>td]:py-3 align-top">
                <td>
                  <span className={`inline-flex rounded-full border px-2 py-1 text-xs ${badgeClassByCategory(q.category)}`}>
                    {q.category ?? "其他"}
                  </span>
                </td>
                <td className="font-medium text-gray-900">{q.title}</td>
                <td className="whitespace-pre-wrap text-gray-700">{clean(q.start)}</td>
                <td className="whitespace-pre-wrap text-gray-700">{clean(q.requirements)}</td>
                <td className="whitespace-pre-wrap text-gray-700">{clean(q.rewards)}</td>
                <td className="text-right">
                  {Array.isArray(q.updates) && q.updates.length ? (
                    <details className="inline-block text-left">
                      <summary className="cursor-pointer text-blue-600 hover:underline">查看</summary>
                      <div className="mt-2 w-[360px] rounded-xl border bg-white p-3 shadow-sm">
                        <div className="text-xs text-muted-foreground">
                          {q.source ? `來源：${q.source}` : "來源：—"}
                        </div>
                        <div className="mt-2 space-y-2 text-sm text-gray-700">
                          {q.updates.map((u, idx) => (
                            <div key={idx} className="rounded-lg border bg-gray-50 p-2">
                              <div className="text-xs text-muted-foreground">{u.version ? `版本：${u.version}` : "版本：—"}</div>
                              <div className="mt-1 whitespace-pre-wrap">{u.text}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, text, wide }: { label: string; text?: string; wide?: boolean }) {
  return (
    <div className={`${wide ? "md:col-span-2" : ""} rounded-xl border bg-gray-50 p-4`}>
      <div className="text-xs font-medium text-gray-700">{label}</div>
      <div className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{clean(text)}</div>
    </div>
  );
}
