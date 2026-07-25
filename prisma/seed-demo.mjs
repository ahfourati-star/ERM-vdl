// One-off demo seeder: fills "Entreprise Test Alpha" with realistic sample
// risks, controls and action plans so every dashboard page has data to show.
// Run: node prisma/seed-demo.mjs
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const ORG_ID = "cmrz2f9jh0000itc8166km2bc"; // Entreprise Test Alpha

const RISKS = [
  { title: "Sous-financement structurel / révision budgétaire", category: "Financier", process: "Financement", cause: "Complexité des règles de financement et révisions pluriannuelles", pi: 4, ii: 5, pr: 3, ir: 4, pt: 2, it: 3, expo: 2500000 },
  { title: "Retard de récupération des créances", category: "Financier", process: "Trésorerie", cause: "Délais de remboursement et litiges de facturation", pi: 4, ii: 4, pr: 3, ir: 3, pt: 2, it: 3, expo: 1200000 },
  { title: "Pénurie de personnel qualifié", category: "Opérationnel", process: "Ressources humaines", cause: "Marché de l'emploi tendu, absentéisme", pi: 5, ii: 4, pr: 4, ir: 4, pt: 3, it: 3, expo: 3000000 },
  { title: "Attaque par rançongiciel paralysant le SI", category: "Cyber / SI", process: "Système d'information", cause: "Exposition des systèmes, hameçonnage", pi: 3, ii: 5, pr: 2, ir: 5, pt: 2, it: 4, expo: 4000000 },
  { title: "Non-conformité RGPD sur données sensibles", category: "Conformité", process: "Protection des données", cause: "Volume de données sensibles, sous-traitants", pi: 3, ii: 4, pr: 2, ir: 4, pt: 1, it: 3, expo: 900000 },
  { title: "Événement indésirable grave évitable", category: "Qualité", process: "Prise en charge", cause: "Complexité des parcours, charge de travail", pi: 3, ii: 5, pr: 2, ir: 4, pt: 1, it: 4, expo: 1800000 },
  { title: "Perte d'un agrément / accréditation", category: "Conformité", process: "Agréments", cause: "Évolution des normes, non-conformité", pi: 2, ii: 5, pr: 1, ir: 5, pt: 1, it: 4, expo: 2200000 },
  { title: "Position défavorable dans la recomposition du secteur", category: "Stratégique", process: "Partenariats", cause: "Réforme, concurrence régionale", pi: 3, ii: 4, pr: 3, ir: 3, pt: 2, it: 3, expo: 1600000 },
  { title: "Non-respect d'un covenant bancaire", category: "Financier", process: "Endettement", cause: "Dégradation des résultats, investissements lourds", pi: 2, ii: 5, pr: 2, ir: 4, pt: 1, it: 3, expo: 2800000 },
  { title: "Dépendance à un fournisseur critique", category: "Opérationnel", process: "Achats", cause: "Faible substituabilité, contrat unique", pi: 3, ii: 4, pr: 3, ir: 3, pt: 2, it: 2, expo: 700000 },
  { title: "Contentieux en responsabilité", category: "Juridique", process: "Responsabilité", cause: "Aléa, judiciarisation", pi: 3, ii: 3, pr: 2, ir: 3, pt: 1, it: 3, expo: 1000000 },
  { title: "Répartition inadéquate des frais communs", category: "Financier", process: "Frais d'administration", cause: "Clés de répartition contestables", pi: 3, ii: 3, pr: 2, ir: 3, pt: 1, it: 2, expo: 600000 },
];

const CONTROLS = [
  { name: "Suivi analytique et reporting", type: "DETECTIVE", efficacy: 3 },
  { name: "Procédure et politique interne", type: "PREVENTIVE", efficacy: 4 },
  { name: "Plan de continuité / secours", type: "CORRECTIVE", efficacy: 3 },
];

const ACTIONS = [
  { title: "Renforcer le contrôle et la documentation", status: "IN_PROGRESS", percentComplete: 40, due: "2026-06-30" },
  { title: "Automatiser le suivi et les relances", status: "NOT_STARTED", percentComplete: 0, due: "2026-03-31" },
  { title: "Audit et mise en conformité", status: "DONE", percentComplete: 100, due: "2026-01-31" },
];

async function main() {
  const memberships = await prisma.membership.findMany({
    where: { orgId: ORG_ID },
    include: { profile: true },
  });
  if (!memberships.length) throw new Error("No memberships for org");

  // Clear existing risks (cascades to controls + action plans) for a clean demo.
  await prisma.risk.deleteMany({ where: { orgId: ORG_ID } });

  const statuses = ["OPEN", "IN_PROGRESS", "CLOSED"];
  let i = 0;
  for (const r of RISKS) {
    const owner = memberships[i % memberships.length];
    const risk = await prisma.risk.create({
      data: {
        orgId: ORG_ID,
        title: r.title,
        description: r.cause,
        category: r.category,
        process: r.process,
        status: statuses[i % statuses.length],
        inherentProbability: r.pi,
        inherentImpact: r.ii,
        residualProbability: r.pr,
        residualImpact: r.ir,
        targetProbability: r.pt,
        targetImpact: r.it,
        exposureAmount: r.expo,
        ownerMembershipId: owner.id,
      },
    });

    // 1-2 controls per risk
    const c1 = CONTROLS[i % CONTROLS.length];
    await prisma.control.create({ data: { orgId: ORG_ID, riskId: risk.id, ...c1 } });
    if (i % 2 === 0) {
      const c2 = CONTROLS[(i + 1) % CONTROLS.length];
      await prisma.control.create({ data: { orgId: ORG_ID, riskId: risk.id, ...c2 } });
    }

    // 1 action plan per risk (skip a couple to create "sans plan" cases)
    if (i % 5 !== 4) {
      const a = ACTIONS[i % ACTIONS.length];
      await prisma.actionPlan.create({
        data: {
          orgId: ORG_ID,
          riskId: risk.id,
          title: a.title,
          status: a.status,
          percentComplete: a.percentComplete,
          dueDate: new Date(a.due),
          ownerMembershipId: owner.id,
        },
      });
    }
    i++;
  }

  const count = await prisma.risk.count({ where: { orgId: ORG_ID } });
  console.log("Seeded. Alpha now has", count, "risks.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
