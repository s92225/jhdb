import Link from "next/link";
import EmptyState from "@/app/components/EmptyState";
import { getSkills } from "@/lib/data";

export default async function ComparePage({
  searchParams,
}: {
  searchParams?: { ids?: string };
}) {
  const skills = await getSkills();
  const ids = (searchParams?.ids ?? "")
    .split(",")
    .map((s) => decodeURIComponent(s.trim()))
    .filter(Boolean);

  const selected = skills.filter((s) => ids.includes(s.id));

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">武技比較</h1>
          <p className="mt-2 text-sm text-slate-600">
            從武技列表勾選「比較」後，會在這裡以同一張表呈現。缺資料欄位會保持空白。
          </p>
        </div>
        <Link
          href="/skills"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
        >
          回武技列表
        </Link>
      </div>

      {selected.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="尚未選擇武技"
            description="請回到武技列表勾選想比較的武技（建議 2～6 個）。"
          />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3">欄位</th>
                {selected.map((s) => (
                  <th key={s.id} className="px-4 py-3">
                    <Link href={`/skills/${s.id}`} className="hover:underline" title="查看詳細">
                      {s.name || "(未命名)"}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(
                [
                  ["來源", (s: any) => s.sourceTag],
                  ["門派/系統", (s: any) => s.sect],
                  ["階級", (s: any) => s.tier],
                  ["配置", (s: any) => s.configs],
                  ["內力需求", (s: any) => s.requirement?.neili],
                  ["精力需求", (s: any) => s.requirement?.jingli],
                  ["前置技能", (s: any) => s.requirement?.prerequisites],
                  ["平均內傷", (s: any) => s.averages?.neishang],
                  ["平均臂傷", (s: any) => s.averages?.bishang],
                  ["平均被閃", (s: any) => s.averages?.beishan],
                  ["平均被招", (s: any) => s.averages?.beizhao],
                ] as const
              ).map(([label, getter]) => (
                <tr key={label} className="align-top">
                  <td className="px-4 py-3 font-medium text-slate-700">{label}</td>
                  {selected.map((s) => {
                    const val = getter(s);
                    return (
                      <td key={s.id + label} className="px-4 py-3 text-slate-700">
                        {renderValue(label, val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function renderValue(label: string, val: any) {
  if (val === null || val === undefined || val === "") return <span className="text-slate-400">(空白)</span>;

  if (label === "前置技能" && Array.isArray(val)) {
    if (val.length === 0) return <span className="text-slate-400">(空白)</span>;
    return (
      <ul className="list-disc pl-5">
        {val.map((p: any, i: number) => (
          <li key={i}>
            {p?.skillId}
            {p?.level ? ` ${p.level}` : ""}
          </li>
        ))}
      </ul>
    );
  }

  if (Array.isArray(val)) {
    if (val.length === 0) return <span className="text-slate-400">(空白)</span>;
    return (
      <div className="flex flex-wrap gap-2">
        {val.map((x: any, i: number) => (
          <span key={i} className="rounded-full border border-slate-200 px-2 py-0.5 text-xs">
            {String(x)}
          </span>
        ))}
      </div>
    );
  }

  return String(val);
}
