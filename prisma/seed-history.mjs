// One-off: seed 5 past quarterly snapshots for "Entreprise Test Alpha" so the
// Tendance page shows a real multi-quarter trend (criticality declining as
// controls take effect). Run: node prisma/seed-history.mjs
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const ORG_ID = "cmrz2f9jh0000itc8166km2bc";

// Past quarters (chronological). Factor scales past criticality relative to the
// current residual value — higher in the past, converging toward today.
const PERIODS = [
  { period: "T2 2025", periodOrder: 20252, factor: 1.6 },
  { period: "T3 2025", periodOrder: 20253, factor: 1.45 },
  { period: "T4 2025", periodOrder: 20254, factor: 1.35 },
  { period: "T1 2026", periodOrder: 20261, factor: 1.28 },
  { period: "T2 2026", periodOrder: 20262, factor: 1.2 },
];

const niveau = (c) => (c <= 4 ? "Faible" : c <= 9 ? "Moyen" : c <= 14 ? "Élevé" : "Critique");

async function main() {
  const risks = await prisma.risk.findMany({
    where: { orgId: ORG_ID },
    select: { id: true, residualProbability: true, residualImpact: true, exposureAmount: true },
  });
  if (!risks.length) throw new Error("No risks to snapshot for Alpha");

  await prisma.riskSnapshot.deleteMany({ where: { orgId: ORG_ID } });

  const rows = [];
  for (const p of PERIODS) {
    for (const r of risks) {
      const curCr = r.residualProbability * r.residualImpact || 1;
      const cr = Math.max(1, Math.min(25, Math.round(curCr * p.factor)));
      const curExpo = Number(r.exposureAmount ?? 0);
      const exposure = Math.round((curExpo * cr) / curCr);
      rows.push({
        orgId: ORG_ID,
        riskId: r.id,
        period: p.period,
        periodOrder: p.periodOrder,
        cr,
        exposure,
        level: niveau(cr),
      });
    }
  }

  await prisma.riskSnapshot.createMany({ data: rows });
  console.log(`Seeded ${rows.length} snapshots across ${PERIODS.length} quarters for ${risks.length} risks.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
