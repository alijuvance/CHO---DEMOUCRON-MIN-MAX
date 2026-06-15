const fs = require('fs');
const path = require('path');

const fPath = (p) => path.join(__dirname, 'frontend', 'src', p);

const pageTsxPath = fPath('app/projects/[id]/page.tsx');
let pageTsx = fs.readFileSync(pageTsxPath, 'utf8');

// Add safe fallbacks for Gantt and PERT rendering when 0 tasks exist
pageTsx = pageTsx.replace(
  `{/* ONGLET GANTT */}`,
  `{/* ONGLET GANTT */}\n      {activeTab === 'gantt' && project.tasks?.length === 0 && <div className="p-12 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">Ajoutez des tâches puis lancez l'analyse pour visualiser le Gantt.</div>}`
);

pageTsx = pageTsx.replace(
  `{/* ONGLET PERT */}`,
  `{/* ONGLET PERT */}\n      {activeTab === 'pert' && project.tasks?.length === 0 && <div className="p-12 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">Ajoutez des tâches puis lancez l'analyse pour visualiser le réseau PERT.</div>}`
);

// Prevent rendering components if 0 tasks
pageTsx = pageTsx.replace(
  `{activeTab === 'gantt' && (`,
  `{activeTab === 'gantt' && project.tasks?.length > 0 && (`
);

pageTsx = pageTsx.replace(
  `{activeTab === 'pert' && (`,
  `{activeTab === 'pert' && project.tasks?.length > 0 && (`
);

fs.writeFileSync(pageTsxPath, pageTsx);

// Fix PertDiagram component to be extremely robust against missing Dagre nodes
const pertPath = fPath('components/graph/PertDiagram.tsx');
let pertTsx = fs.readFileSync(pertPath, 'utf8');

if (!pertTsx.includes('if (!tasks || tasks.length === 0)')) {
  pertTsx = pertTsx.replace(
    `const { tasks, dependencies } = useProjectStore();`,
    `const { tasks, dependencies } = useProjectStore();\n  if (!tasks || tasks.length === 0) return null;`
  );
  fs.writeFileSync(pertPath, pertTsx);
}

console.log("Frontend refactoring complete");
