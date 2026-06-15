interface Task {
  id: number;
  name: string;
  duration: number;
}

interface Dependency {
  sourceId: number;
  targetId: number;
}

interface AnalyzedTask extends Task {
  level: number | null;
  earliestStart: number | null;
  earliestFinish: number | null;
  latestStart: number | null;
  latestFinish: number | null;
  totalMargin: number | null;
  freeMargin: number | null;
  isCritical: boolean;
}

export class DemoucronEngine {
  /**
   * 1. Détection de cycles avec DFS
   */
  static detectCycle(tasks: Task[], dependencies: Dependency[]): boolean {
    const adj = new Map<number, number[]>();
    tasks.forEach(t => adj.set(t.id, []));
    dependencies.forEach(d => {
      if (adj.has(d.sourceId)) {
        adj.get(d.sourceId)!.push(d.targetId);
      }
    });

    const visited = new Set<number>();
    const recStack = new Set<number>();

    for (const task of tasks) {
      if (this.dfsCycleUtil(task.id, visited, recStack, adj)) {
        return true;
      }
    }
    return false;
  }

  private static dfsCycleUtil(v: number, visited: Set<number>, recStack: Set<number>, adj: Map<number, number[]>): boolean {
    if (recStack.has(v)) return true;
    if (visited.has(v)) return false;

    visited.add(v);
    recStack.add(v);

    const neighbors = adj.get(v) || [];
    for (const neighbor of neighbors) {
      if (this.dfsCycleUtil(neighbor, visited, recStack, adj)) {
        return true;
      }
    }
    recStack.delete(v);
    return false;
  }

  /**
   * Exécution complète de l'algorithme
   */
  static analyze(tasks: Task[], dependencies: Dependency[]): AnalyzedTask[] {
    if (this.detectCycle(tasks, dependencies)) {
      throw new Error("Le graphe contient un cycle - Ordonnancement impossible.");
    }

    const analyzedTasks: Map<number, AnalyzedTask> = new Map(
      tasks.map(t => [t.id, { ...t, level: null, earliestStart: null, earliestFinish: null, latestStart: null, latestFinish: null, totalMargin: null, freeMargin: null, isCritical: false }])
    );

    // Initialisation
    const inDegree = new Map<number, number>();
    const graph = new Map<number, number[]>(); // source -> targets
    const reverseGraph = new Map<number, number[]>(); // target -> sources

    tasks.forEach(t => {
      inDegree.set(t.id, 0);
      graph.set(t.id, []);
      reverseGraph.set(t.id, []);
    });

    dependencies.forEach(d => {
      inDegree.set(d.targetId, (inDegree.get(d.targetId) || 0) + 1);
      graph.get(d.sourceId)!.push(d.targetId);
      reverseGraph.get(d.targetId)!.push(d.sourceId);
    });

    // 2. Algorithme de Demoucron (Niveaux)
    let currentLevel = 0;
    let remaining = tasks.length;
    let queue: number[] = [];

    // Trouver les sources initiales
    for (const [id, degree] of inDegree.entries()) {
      if (degree === 0) queue.push(id);
    }

    const topoOrder: number[] = [];

    while (queue.length > 0) {
      const nextQueue: number[] = [];
      for (const id of queue) {
        analyzedTasks.get(id)!.level = currentLevel;
        topoOrder.push(id);
        remaining--;

        for (const neighbor of graph.get(id)!) {
          inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
          if (inDegree.get(neighbor) === 0) {
            nextQueue.push(neighbor);
          }
        }
      }
      queue = nextQueue;
      currentLevel++;
    }

    if (remaining > 0) {
      throw new Error("Erreur inattendue : graphe non vide après Demoucron (cycle non détecté par DFS ?).");
    }

    // 3. Forward Pass (MIN) - Dates au plus tôt
    let projectDuration = 0;
    for (const id of topoOrder) {
      const task = analyzedTasks.get(id)!;
      const preds = reverseGraph.get(id)!;
      let es = 0;
      if (preds.length > 0) {
        es = Math.max(...preds.map(pId => analyzedTasks.get(pId)!.earliestFinish!));
      }
      task.earliestStart = es;
      task.earliestFinish = es + task.duration;
      projectDuration = Math.max(projectDuration, task.earliestFinish);
    }

    // 4. Backward Pass (MAX) - Dates au plus tard
    // Parcourir dans l'ordre inverse
    for (let i = topoOrder.length - 1; i >= 0; i--) {
      const id = topoOrder[i];
      const task = analyzedTasks.get(id)!;
      const succs = graph.get(id)!;
      
      let lf = projectDuration;
      if (succs.length > 0) {
        lf = Math.min(...succs.map(sId => analyzedTasks.get(sId)!.latestStart!));
      }
      task.latestFinish = lf;
      task.latestStart = lf - task.duration;
    }

    // 5. Calcul des Marges & Chemin Critique
    for (const task of analyzedTasks.values()) {
      // Marge totale (MT = LS - ES)
      task.totalMargin = task.latestStart! - task.earliestStart!;
      
      // Marge libre (ML = min(ES successeurs) - EF)
      const succs = graph.get(task.id)!;
      if (succs.length === 0) {
        task.freeMargin = projectDuration - task.earliestFinish!; // Ou 0 selon les conventions
      } else {
        const minSuccsEs = Math.min(...succs.map(sId => analyzedTasks.get(sId)!.earliestStart!));
        task.freeMargin = minSuccsEs - task.earliestFinish!;
      }

      // Chemin critique
      if (task.totalMargin === 0) {
        task.isCritical = true;
      }
    }

    return Array.from(analyzedTasks.values());
  }
}
