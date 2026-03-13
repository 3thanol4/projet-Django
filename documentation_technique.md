# Documentation Technique du Projet

Ce document fournit les instructions de configuration et de lancement du projet (Frontend et Backend), ainsi qu'une description des modèles de données et des routes API disponibles.

## 1. Instructions pour configurer et lancer le projet

Le projet est divisé en deux parties principales : un backend en Django (Python) et un frontend en Angular (TypeScript).

### A. Configuration du Backend (Django)

1. **Prérequis** : Avoir Python (3.10+) installé.
2. **Accéder au dossier backend** :
   ```bash
   cd backend
   ```
3. **Créer et activer l'environnement virtuel** :
   ```bash
   python -m venv .venv
   # Activation sur Windows :
   .venv\Scripts\activate
   # Activation sur Mac/Linux :
   source .venv/bin/activate
   ```
4. **Installer les dépendances** :
   *(S'il y a un fichier requirements.txt)*
   ```bash
   pip install -r requirements.txt
   ```
5. **Appliquer les migrations de la base de données** :
   ```bash
   python manage.py migrate
   ```
6. **Lancer le serveur de développement** :
   ```bash
   python manage.py runserver
   ```
   Le backend sera accessible sur `http://127.0.0.1:8000/`.

### B. Configuration du Frontend (Angular)

1. **Prérequis** : Avoir Node.js et npm (recommandé v11.x+) installés.
2. **Accéder au dossier frontend** :
   ```bash
   cd frontend
   ```
3. **Installer les dépendances** :
   ```bash
   npm install
   ```
4. **Lancer le serveur de développement** :
   ```bash
   npm start
   ```
   L'application Angular sera accessible sur `http://localhost:4200/`.

---

## 2. Modèles de Données

Le backend Django repose sur trois modèles principaux, qui gèrent les utilisateurs, les projets et les tâches associées.

### Modèle [User] (Utilisateur)
Hérite du modèle `AbstractUser` de Django et ajoute des champs spécifiques.
- **role** : Rôle de l'utilisateur. Choix possibles : `ETUDIANT` ou `PROFESSEUR`.
- **avatar** : Image de profil optionnelle.
- *(Inclut également les champs de base de Django : username, email, password, etc.)*

### Modèle [Project] (Projet)
Représente un projet géré par un utilisateur (professeur généralement) et contenant des membres.
- **name** : Nom du projet (`CharField`).
- **description** : Description du projet (`TextField`, optionnel).
- **owner** : Le créateur/responsable du projet (`ForeignKey` vers [User](file:///c:/Users/EthanKambou/Desktop/Python/Projet-Django/backend/users/models.py#4-12)).
- **members** : Les membres associés à ce projet (`ManyToManyField` vers [User](file:///c:/Users/EthanKambou/Desktop/Python/Projet-Django/backend/users/models.py#4-12)).
- **created_at** : Date et heure de création (`DateTimeField`).

### Modèle [Task] (Tâche)
Représente une tâche attribuée dans le cadre d'un projet.
- **title** : Titre de la tâche (`CharField`).
- **description** : Détail de la tâche (`TextField`, optionnel).
- **deadline** : Date limite (`DateField`).
- **status** : État d'avancement (`CharField`). Choix : `à faire`, `en cours`, `terminé`. (Défaut : `à faire`).
- **completed_at** : Date de finalisation (`DateTimeField`, optionnel).
- **project** : Le projet auquel la tâche appartient (`ForeignKey` vers [Project]).
- **assigned_to** : L'utilisateur en charge de la tâche (`ForeignKey` vers [User], optionnel).
- **created_at** : Date et heure de création de la tâche (`DateTimeField`).

---

## 3. Routes API Disponibles (Endpoints)

L'API est construite avec Django Rest Framework (DRF) et est préfixée par `/api/`. L'authentification utilise des JSON Web Tokens (JWT).

### Authentification & Accès (JWT)
- `POST /api/token/` : Obtenir un token d'accès et un token de rafraîchissement (Login).
- `POST /api/token/refresh/` : Rafraîchir le token d'accès.

### Utilisateurs (`/api/`)
- `POST /api/register/` : Inscription d'un nouvel utilisateur.
- `GET /api/users/` : Obtenir la liste des utilisateurs.
- `GET /api/profile/` : Obtenir les informations du profil de l'utilisateur connecté.
- `PUT /api/profile/` : Mettre à jour le profil (potentiellement).
- `GET /api/stats/` : Obtenir des statistiques générales (par exemple pour le tableau de bord).

### Projets (`/api/projects/`)
- `GET /api/projects/` : Lister tous les projets de l'utilisateur connecté.
- `POST /api/projects/` : Créer un nouveau projet.
- `GET /api/projects/<id>/` : Obtenir les détails d'un projet spécifique.
- `PUT /api/projects/<id>/` : Mettre à jour un projet.
- `DELETE /api/projects/<id>/` : Supprimer un projet.

### Tâches (`/api/tasks/`)
- `GET /api/tasks/` : Lister les tâches.
- `POST /api/tasks/` : Créer une nouvelle tâche.
- `GET /api/tasks/<id>/` : Obtenir les détails d'une tâche.
- `DELETE /api/tasks/<id>/` : Supprimer une tâche.

---

## 4. Architecture Frontend (Angular)

L'application Angular est structurée de manière modulaire avec des dossiers par domaine (feature folders). Elle utilise des **composants** (Components) pour l'interface de chaque page, des **services** pour les communications avec l'API Django, ainsi que des outils internes pour centraliser la sécurité (Guards et Interceptor).

### A. Structure du Routage ([app.routes.ts])

La navigation entre les pages de l'application est gérée ici :
- `/login` : Composant de connexion.
- `/register` : Composant d'inscription.
- `/profile` (Protégé) : Composant de gestion du profil de l'utilisateur.
- `/dashboard` (Protégé) : Point d'entrée principal après connexion, affiche la liste de projets.
- `/projects/:id` (Protégé) : Affiche la vue en détail d'un projet désigné par son identifiant.
- `/stats` (Protégé) : Affiche la page de statistiques.

*Par défaut, toute ouverture à la racine sans paramètre redirige vers `/login`.*

### B. Répartition des Composants (Components UI)

L'interface de l'application est découpée en divers écrans interactifs classés par dossier de fonctionnalité :

#### 1. Authtentification et Utilisateurs (`/auth/`)
- **Login / Register Components** : Formulaires de base liés à la prise de contact pour se connecter ou s'inscrire, incluant les vérifications visuelles des mots de passe, requêtes initiales.
- **ProfileComponent** : Gère l'affichage (données, rôle) voire la modification d'un profil utilisateur connecté.

#### 2. Projets et Tableau de Bord (`/projects/`)
- **ProjectListComponent (Dashboard)** : Charge et affiche visuellement la liste complète des projets (`cards` ou listes) de l'utilisateur de manière dynamique une fois connecté.
- **ProjectDetailComponent** : La page complète d'un projet comprenant ses informations détaillées, potentiellement ses membres assignés et, surtout, la liste des tâches qui en dépendent.

#### 3. Tâches (`/tasks/`)
- **TaskListComponent** : Représente la liste et les filtres possibles des différentes tâches au sein d’un projet et permet la gestion directe (création rapide de tâches, validation ou mise en progrès du cycle de la tâche).

#### 4. Statistiques (`/stats/`)
- **StatsComponent** : Dashboard informatif présentant typiquement des indicateurs de l'API Stats pour le contrôle complet.

### C. Services (Logique et Communications API)

Les services sont responsables de la centralisation de toutes les requêtes `HttpClient` vers l'API backend Django (qui réside sous `/api/`). Ils assurent une forte réutilisabilité dans n'importe quel composant :

- **AuthService** : Effectue la logique de connexion (Login, Registre) avec l'API (`/api/token/`). Il stocke le Bearer Token JWT reçu par l'API dans le stockage local (LocalStorage/SessionStorage), décodant potentiellement les informations de session ou vérifiant que l'utilisateur est authentifié avec `isLoggedIn()`.
- **ProjectService** : Effectue la totalité du CRUD projet (`GET`, `POST`, `PUT`, `DELETE` via l'URL `/api/projects/`). Fournit aux composants la liste formatée observable des projets.
- **TaskService** : Identique côté logique pour gérer le cycle de vie des modèles enfants et modifier les statuts des tâches (auprès de `/api/tasks/`).
- **StatsService** : Récupère au fur et à mesure la synthèse depuis `/api/stats/` et la redistribue aux différents composants d'indicateurs visuels.

### D. Le "Core" : Protection des données et API

Ce dossier englobe tous les aspects de la sécurité interne de l'application (JWT) pour tous les appels protégés :

- **AuthGuard ([auth.guard.ts])** : Il agit comme une barrière avant de charger une route (grâce à son hook logique `CanActivate`). Si un visiteur non identifié essaie d'accéder à `/dashboard`, ce garde intercepte la demande en vérifiant `AuthService` et le renvoie sur `/login`.
- **TokenInterceptor ([token.interceptor.ts])** : Il intercepte techniquement toutes les requêtes HTTP sortantes en provenance du client Angular avant qu'elles soient envoyées. Son cycle se charge d'ajouter en coulisse (dans la requête Headers HTTP : `Authorization : Bearer {le_token_réellement_stocké}`) du Token de l'utilisateur pour ne pas avoir à écrire ce même paramètre vital sur le `TaskService` ou le `ProjectService`.
