import { Task } from '../../task/task.entity';
import { Dependency } from '../../dependency/dependency.entity';

export class DemoucronEngine {
  static detectCycle(tasks: Task[], dependencies: Dependency[]): boolean {
    const adj = new Map<number, number[]>();
    tasks.forEach(t => adj.set(t.id, []));
    dependencies.forEach(d => {
      if (adj.has(d.sourceTaskId)) {
        adj.get(d.sourceTaskId)!.push(d.targetTaskId);
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

  static run(tasks: Task[], dependencies: Dependency[]): Task[] {
    if (this.detectCycle(tasks, dependencies)) {
      throw new Error("Le graphe contient un cycle. Ordonnancement impossible.");
    }

    const taskMap = new Map<number, Task>();
    tasks.forEach(t => {
      t.level = null;
      t.earliestStart = null;
      t.earliestFinish = null;
      t.latestStart = null;
      t.latestFinish = null;
      t.totalMargin = null;
      t.freeMargin = null;
      t.isCritical = false;
      taskMap.set(t.id, t);
    });

    const inDegree = new Map<number, number>();
    const graph = new Map<number, number[]>();
    const reverseGraph = new Map<number, number[]>();

    tasks.forEach(t => {
      inDegree.set(t.id, 0);
      graph.set(t.id, []);
      reverseGraph.set(t.id, []);
    });

    dependencies.forEach(d => {
      inDegree.set(d.targetTaskId, (inDegree.get(d.targetTaskId) || 0) + 1);
      graph.get(d.sourceTaskId)!.push(d.targetTaskId);
      reverseGraph.get(d.targetTaskId)!.push(d.sourceTaskId);
    });

    // 1. Niveaux (Demoucron)
    let currentLevel = 0;
    let queue: number[] = [];
    const topoOrder: number[] = [];

    for (const [id, degree] of inDegree.entries()) {
      if (degree === 0) queue.push(id);
    }

    while (queue.length > 0) {
      const nextQueue: number[] = [];
      for (const id of queue) {
        taskMap.get(id)!.level = currentLevel;
        topoOrder.push(id);
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

    // 2. Forward Pass (MIN)
    let projectDuration = 0;
    for (const id of topoOrder) {
      const task = taskMap.get(id)!;
      const preds = reverseGraph.get(id)!;
      let es = 0;
      if (preds.length > 0) {
        es = Math.max(...preds.map(pId => taskMap.get(pId)!.earliestFinish!));
      }
      task.earliestStart = es;
      task.earliestFinish = es + task.duration;
      projectDuration = Math.max(projectDuration, task.earliestFinish);
    }

    // 3. Backward Pass (MAX)
    for (let i = topoOrder.length - 1; i >= 0; i--) {
      const id = topoOrder[i];
      const task = taskMap.get(id)!;
      const succs = graph.get(id)!;
      
      let lf = projectDuration;
      if (succs.length > 0) {
        lf = Math.min(...succs.map(sId => taskMap.get(sId)!.latestStart!));
      }
      task.latestFinish = lf;
      task.latestStart = lf - task.duration;
    }

    // 4. Marges et Chemin Critique
    for (const task of taskMap.values()) {
      task.totalMargin = task.latestStart! - task.earliestStart!;
      const succs = graph.get(task.id)!;
      if (succs.length === 0) {
        task.freeMargin = projectDuration - task.earliestFinish!;
      } else {
        const minSuccsEs = Math.min(...succs.map(sId => taskMap.get(sId)!.earliestStart!));
        task.freeMargin = minSuccsEs - task.earliestFinish!;
      }
      if (task.totalMargin === 0) {
        task.isCritical = true;
      }
    }

    return Array.from(taskMap.values());
  }
}
