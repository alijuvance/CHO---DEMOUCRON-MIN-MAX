# Manuel Utilisateur - Demoucron Min-Max

Bienvenue dans l'application de planification avancée utilisant la méthode Demoucron.

## 1. Créer un Projet
1. Sur la page d'accueil, cliquez sur **Nouveau Projet**.
2. Renseignez un **Nom** (ex: "Construction de Maison") et une description optionnelle.
3. Le projet apparaît immédiatement dans la liste de vos projets. Cliquez dessus pour l'ouvrir.

## 2. Gérer les Données
Dans l'onglet "Données", vous pouvez ajouter les briques de base de votre planification.
- **Tâches** : Entrez le nom et la durée de la tâche, puis cliquez sur "Ajouter".
- **Dépendances** : Sélectionnez la tâche précédente ("Avant...") et la tâche suivante ("Après..."), puis cliquez sur "Lier". Si votre liaison crée une boucle (ex: A dépend de B, qui dépend de A), le système vous bloquera de manière proactive.

## 3. Lancer l'Analyse
Une fois vos tâches et dépendances définies, cliquez sur le bouton **Lancer l'Analyse** (en haut à droite).
Cette action va calculer :
- Les niveaux de chaque tâche.
- Les dates au plus tôt (MIN) et au plus tard (MAX).
- Le chemin critique.

## 4. Visualisations (Vues)
Après analyse, vous pouvez naviguer entre les différents onglets :
- **Niveaux Demoucron** : Affiche les tâches regroupées par niveau d'exécution. Les tâches d'un même niveau peuvent être exécutées en parallèle. Les tâches encadrées en rouge appartiennent au chemin critique.
- **Gantt** : Un diagramme de Gantt classique, affichant la chronologie du projet dans le temps.
- **Réseau PERT** : Une modélisation graphique du réseau. Vous pouvez déplacer les éléments à la souris. Le chemin critique est mis en évidence.

## 5. Exporter les Résultats
Une fois l'analyse terminée, un bouton **Export CSV** apparaît dans la barre de navigation.
En cliquant dessus, vous téléchargez un fichier `.csv` contenant l'intégralité des dates, durées, et marges calculées.
