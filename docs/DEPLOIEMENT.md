# Guide de Déploiement Industrialisé

L'application est entièrement conteneurisée à l'aide de Docker.
La stack complète comprend :
- `db` : Une instance PostgreSQL 16 (optimisée sous Alpine)
- `backend` : L'API NestJS (Node.js)
- `frontend` : L'interface utilisateur Next.js (Node.js)

## 1. Prérequis
- Docker Engine & Docker Compose installés sur le serveur hôte.
- Ports 3000 (HTTP Frontend) et 3001 (HTTP Backend) disponibles.

## 2. Démarrage Rapide

Pour lancer le projet en environnement de production / staging, exécutez simplement à la racine du projet :

```bash
docker-compose up --build -d
```

Cette commande va :
1. Télécharger l'image PostgreSQL.
2. Construire l'image du Backend et l'image du Frontend.
3. Démarrer la base de données.
4. Démarrer le Backend (qui se connectera à la BDD via les variables d'environnement).
5. Démarrer le Frontend (qui communiquera avec le backend).

L'application sera accessible sur : `http://localhost:3000`
L'API Backend sera accessible sur : `http://localhost:3001/api`
La documentation Swagger de l'API sur : `http://localhost:3001/api/docs`

## 3. Optimisations Incluses
- **Healthchecks** : Le backend attend que PostgreSQL soit "ready" avant de démarrer, évitant les crashs intempestifs au lancement (`pg_isready`).
- **Variables d'Environnement** : L'injection via `environment:` dans `docker-compose.yml` garantit que la connexion TypeORM utilise systématiquement PostgreSQL et non SQLite.
- **Auto-Sync DB** : La base de données est synchronisée automatiquement au lancement. En véritable production à très fort trafic, il faudra passer à un système de `Migrations` TypeORM (en passant `synchronize: false`).
