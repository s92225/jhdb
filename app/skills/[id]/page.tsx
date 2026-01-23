import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/app/components/Badge";
import EmptyState from "@/app/components/EmptyState";
import { getSkillById } from "@/lib/data";

export default async function SkillDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const skill = await getSkillById(params.id);
  if (!skill) return notFound();

  const prereqText =
    skill.requirement?.prerequisites && skill.requirement.prerequisites.length
      ? skill.requirement.prerequisites
          .map((p) => (p.level ? `${p.skillId} ${p.level}` : p.skillId))
          .join("、")
      : "";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{skill.name || "(未命名武技)"}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {skill.sourceTag ? <Badge>{skill.sourceTag}</Badge> : null}
            {skill.sect ? <Badge>{skill.sect}</Badge> : null}
            {skill.tier ? <Badge>{skill.tier}</Badge> : null}
            {skill.configs?.map((c) => (
              <Badge key={c}>{c}</Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/skills"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
          >
            回列表
          </Link>
          <Link
            href={`/skills/compare?ids=${encodeURIComponent(skill.id)}`}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
          >
            去比較
          </Link>
        </div>
      </div>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">學習條件</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <InfoRow label="內力需求" value={skill.requirement?.neili} />
          <InfoRow label="精力需求" value={skill.requirement?.jingli} />
          <InfoRow label="前置技能" value={prereqText} />
          <InfoRow label="備註" value={skill.requirement?.notes ?? ""} />
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">數值概覽</h2>
        {skill.averages ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <InfoRow label="平均內傷" value={skill.averages.neishang} />
            <InfoRow label="平均臂傷" value={skill.averages.bishang} />
            <InfoRow label="平均被閃" value={skill.averages.beishan} />
            <InfoRow label="平均被招" value={skill.averages.beizhao} />
          </div>
        ) : (
          <div className="mt-3">
            <EmptyState
              title="尚無數值資料"
              description="如果來源檔沒有平均值/統計值，這裡會保持空白。"
            />
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">招式明細</h2>
          <span className="text-sm text-slate-500">缺招式會顯示空表（不亂補）</span>
        </div>

        {skill.moves && skill.moves.length > 0 ? (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-3 py-2">招式</th>
                  <th className="px-3 py-2">等級</th>
                  <th className="px-3 py-2">內傷</th>
                  <th className="px-3 py-2">臂傷</th>
                  <th className="px-3 py-2">被閃</th>
                  <th className="px-3 py-2">被招</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {skill.moves.map((m, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">{m.name || ""}</td>
                    <td className="px-3 py-2">{m.level ?? ""}</td>
                    <td className="px-3 py-2">{m.neishang ?? ""}</td>
                    <td className="px-3 py-2">{m.bishang ?? ""}</td>
                    <td className="px-3 py-2">{m.beishan ?? ""}</td>
                    <td className="px-3 py-2">{m.beizhao ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-3">
            <EmptyState title="尚無招式資料" description="來源檔沒有提供招式表時會顯示空白。" />
          </div>
        )}
      </section>

      {skill.rawSource ? (
        <p className="mt-6 text-xs text-slate-500">來源：{skill.rawSource}</p>
      ) : null}
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  const isEmpty = value === null || value === undefined || value === "";
  return (
    <div className="rounded-lg border border-slate-200 px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm text-slate-800">
        {isEmpty ? <span className="text-slate-400">(空白)</span> : String(value)}
      </div>
    </div>
  );
}
