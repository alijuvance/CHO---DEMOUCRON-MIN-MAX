const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
  const fullPath = path.join(__dirname, 'frontend', 'src', filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim());
};

// Zustand Store
write('store/projectStore.ts', `
import { create } from 'zustand';

interface Task {
  id: number;
  name: string;
  duration: number;
  level: number | null;
  earliestStart: number | null;
  earliestFinish: number | null;
  latestStart: number | null;
  latestFinish: number | null;
  totalMargin: number | null;
  freeMargin: number | null;
  isCritical: boolean;
}

interface Dependency {
  id: number;
  sourceTaskId: number;
  targetTaskId: number;
}

interface ProjectState {
  tasks: Task[];
  dependencies: Dependency[];
  setTasks: (tasks: Task[]) => void;
  setDependencies: (deps: Dependency[]) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  tasks: [],
  dependencies: [],
  setTasks: (tasks) => set({ tasks }),
  setDependencies: (dependencies) => set({ dependencies }),
}));
`);

// API Service
write('services/api.ts', `
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const fetchProjects = async () => {
  const res = await fetch(\`\${API_URL}/projects\`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
};

export const fetchProjectDetails = async (id: number) => {
  const res = await fetch(\`\${API_URL}/projects/\${id}\`);
  if (!res.ok) throw new Error('Failed to fetch project details');
  return res.json();
};

export const runAnalysis = async (projectId: number) => {
  const res = await fetch(\`\${API_URL}/analysis/\${projectId}/run\`, { method: 'POST' });
  if (!res.ok) throw new Error('Analysis failed');
  return res.json();
};
`);

// React Query Provider wrapper
write('components/QueryProvider.tsx', `
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
`);

// Main layout modification
write('app/layout.tsx', `
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/components/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Demoucron Min-Max',
  description: 'Système Intelligent d\\'Ordonnancement et d\\'Optimisation de Projet',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <QueryProvider>
          <main className="min-h-screen bg-slate-50 text-slate-900">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
`);

console.log("Frontend structure generated successfully!");
