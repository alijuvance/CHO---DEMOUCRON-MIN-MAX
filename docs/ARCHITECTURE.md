# Architecture du Projet - Demoucron Min-Max

Le projet est divisé en trois composants majeurs :
1. **Frontend (Next.js)** : Interface utilisateur interactive et moderne (React Flow, Gantt).
2. **Backend (NestJS)** : API REST gérant les algorithmes complexes, avec une architecture orientée domaine (DDD).
3. **Database (PostgreSQL)** : Stockage relationnel persistant.

## 1. Principes d'Architecture (Backend)

Nous appliquons les principes **SOLID** et l'**Architecture Orientée Domaine** :
- **Séparation des Responsabilités (SRP)** : Chaque module gère son propre domaine métier. `ProjectModule`, `TaskModule`, `DependencyModule` gèrent le CRUD, tandis que `AnalysisModule` se charge de l'orchestration algorithmique.
- **Inversion de Dépendance (DIP)** : L'algorithme principal (`DemoucronEngine`) est isolé du framework (NestJS) pour être totalement testable et indépendant des dépendances HTTP ou de base de données.

## 2. L'Algorithme de Demoucron (Engine)

L'implémentation de la méthode Demoucron se trouve dans `backend/src/analysis/engine/demoucron.engine.ts`.
Sa complexité est optimale : **O(V + E)** (où V = Tâches, E = Dépendances).
Il effectue 5 passes majeures :
1. **Validation** : Création du graphe orienté en mémoire. Détection de cycles (DFS) pour lever une exception en cas de boucle.
2. **Niveaux (Demoucron)** : Tri topologique basé sur les degrés entrants (algorithme de Kahn). Les tâches de degré 0 sont assignées au niveau 0, puis retirées, et ainsi de suite.
3. **Passe Avant (Dates au plus tôt - MIN)** : Pour chaque tâche, `earliestStart = MAX(earliestFinish des prédécesseurs)`.
4. **Passe Arrière (Dates au plus tard - MAX)** : Pour chaque tâche en commençant par les puits, `latestFinish = MIN(latestStart des successeurs)`.
5. **Marges & Chemin Critique** : Calcul de la marge totale (`latestStart - earliestStart`), de la marge libre, et identification du chemin critique (Marge Totale = 0).

## 3. Frontend

Le frontend est construit avec **Next.js (App Router)** et exploite :
- **React Query** pour le cache et les requêtes API asynchrones optimisées.
- **Zustand** pour le store global (synchronisation entre les vues).
- **React Flow** pour le diagramme réseau PERT interactif.
- **Tailwind CSS** pour l'UI, garantissant une esthétique premium, responsive et cohérente (Glassmorphism, micro-animations).

## 4. Schéma de Base de Données

- **Project** (1) ----> (N) **Task**
- **Project** (1) ----> (N) **Dependency**
- **Dependency** référence `sourceTaskId` et `targetTaskId` pointant vers la table **Task**.
