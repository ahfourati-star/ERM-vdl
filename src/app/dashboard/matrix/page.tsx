import { requireMembership } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { criticality, levelFor } from "@/lib/risk";

export default async function MatrixPage() {
  const { membership } = await requireMembership();

  const risks = await prisma.risk.findMany({
    where: { orgId: membership.orgId },
    select: { id: true, title: true, residualProbability: true, residualImpact: true },
  });

  const grid = Array.from({ length: 5 }, (_, rowIndex) => {
    const probability = 5 - rowIndex;
    return Array.from({ length: 5 }, (_, colIndex) => {
      const impact = colIndex + 1;
      const cellRisks = risks.filter(
        (r) => r.residualProbability === probability && r.residualImpact === impact
      );
      return { probability, impact, risks: cellRisks };
    });
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Matrice des risques (5x5)</h1>
        <p className="text-muted-foreground">
          Basée sur la criticité résiduelle (probabilité × impact) de chaque risque.
        </p>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-col justify-between py-6 pr-2 text-xs font-medium text-muted-foreground">
          {[5, 4, 3, 2, 1].map((p) => (
            <div key={p} className="flex h-20 items-center">
              P{p}
            </div>
          ))}
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-5 gap-2">
            {grid.flat().map((cell) => {
              const score = criticality(cell.probability, cell.impact);
              const level = levelFor(score);
              return (
                <div
                  key={`${cell.probability}-${cell.impact}`}
                  className="flex h-20 flex-col items-center justify-center rounded-lg"
                  style={{ background: level.fill, color: "#333" }}
                  title={cell.risks.map((r) => r.title).join(", ")}
                >
                  <span className="text-lg font-bold">{cell.risks.length}</span>
                  <span className="text-xs opacity-70">score {score}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 grid grid-cols-5 gap-2 text-center text-xs font-medium text-muted-foreground">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i}>I{i}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800">
          Faible
        </span>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">
          Moyen
        </span>
        <span className="rounded-full bg-orange-100 px-2 py-0.5 font-medium text-orange-800">
          Élevé
        </span>
        <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-800">
          Critique
        </span>
      </div>
    </div>
  );
}
