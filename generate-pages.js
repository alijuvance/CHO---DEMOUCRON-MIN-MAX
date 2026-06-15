const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
  const fullPath = path.join(__dirname, 'frontend', 'src', filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim());
};

write('app/page.tsx', `
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="text-center space-y-6 max-w-3xl">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Système Intelligent <span className="text-blue-400">d'Ordonnancement</span>
        </h1>
        <p className="text-lg text-slate-300">
          Modélisez, planifiez et optimisez vos projets avec l'algorithme de Demoucron et l'analyse des dates au plus tôt / plus tard (Min-Max).
        </p>
        <div className="pt-8 flex justify-center gap-4">
          <Link href="/projects" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-semibold transition-colors shadow-lg shadow-blue-500/30">
            Gérer les Projets
          </Link>
          <a href="http://localhost:3001/api/docs" target="_blank" className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-full font-semibold transition-colors">
            Documentation API
          </a>
        </div>
      </div>
    </div>
  );
}
`);

write('app/projects/page.tsx', `
'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '@/services/api';
import Link from 'next/link';

export default function Projects() {
  const { data: projects, isLoading } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes Projets</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700">
          + Nouveau Projet
        </button>
      </div>

      {isLoading ? (
        <div>Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project: any) => (
            <Link href={\`/projects/\${project.id}\`} key={project.id}>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
                <h2 className="text-xl font-bold mb-2">{project.name}</h2>
                <p className="text-slate-500 text-sm line-clamp-2">{project.description || 'Aucune description'}</p>
              </div>
            </Link>
          ))}
          {projects?.length === 0 && (
            <div className="col-span-full text-center p-12 bg-slate-100 rounded-lg text-slate-500">
              Aucun projet trouvé. Créez-en un pour commencer !
            </div>
          )}
        </div>
      )}
    </div>
  );
}
`);

console.log("Pages generated successfully!");
