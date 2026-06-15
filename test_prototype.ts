import { DemoucronEngine } from './prototype';

const tasks = [
  { id: 1, name: 'A', duration: 3 },
  { id: 2, name: 'B', duration: 2 },
  { id: 3, name: 'C', duration: 4 },
  { id: 4, name: 'D', duration: 1 },
  { id: 5, name: 'E', duration: 3 },
  { id: 6, name: 'F', duration: 2 }
];

const dependencies = [
  { sourceId: 1, targetId: 2 }, // A -> B
  { sourceId: 1, targetId: 3 }, // A -> C
  { sourceId: 2, targetId: 4 }, // B -> D
  { sourceId: 2, targetId: 5 }, // B -> E
  { sourceId: 3, targetId: 5 }, // C -> E
  { sourceId: 4, targetId: 6 }, // D -> F
  { sourceId: 5, targetId: 6 }  // E -> F
];

try {
  console.log("Exécution de l'algorithme Demoucron Min-Max...\n");
  const result = DemoucronEngine.analyze(tasks, dependencies);
  
  console.table(result.map(t => ({
    Task: t.name,
    Duration: t.duration,
    Level: t.level,
    ES: t.earliestStart,
    EF: t.earliestFinish,
    LS: t.latestStart,
    LF: t.latestFinish,
    MT: t.totalMargin,
    ML: t.freeMargin,
    Critical: t.isCritical ? 'Oui' : 'Non'
  })));

  // Vérification mathématique
  // Chemin critique attendu : A -> C -> E -> F = 3 + 4 + 3 + 2 = 12
  const criticalPath = result.filter(t => t.isCritical).map(t => t.name).join(' -> ');
  console.log(`\nChemin Critique identifié : ${criticalPath}`);
  
  if (criticalPath === 'A -> C -> E -> F') {
    console.log("✅ Validation mathématique réussie !");
  } else {
    console.error("❌ Échec de la validation mathématique !");
  }

} catch (e) {
  console.error("Erreur:", e);
}
