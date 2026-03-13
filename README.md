

# Dupas & Co. Le grand Art Déco

## C'est quoi ?

Une expérience interactive sur l'écran tactile du MusBA réalisée lors de l'**Exposition Dupas & Co. Le grand Art Déco** du 26 juin au 29 novembre 2026. Elle est réalisée par la promotion 2026 du BUT MMI Bordeaux.

L'expérience propose une **carte WebGL interactive** permettant d'explorer des œuvres d'art réparties sur deux continents (Europe et Amérique), organisées en villes et musées. Chaque musée donne accès à un détail d'œuvres avec carrousel, textes et images cliquables.

## Stack technique

| Catégorie | Technologie |
| :--- | :--- |
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Build | Vite 7 |
| 3D / WebGL | Three.js + camera-controls |
| Animations | GSAP, split-type |
| État global | Pinia |
| Routing | Vue Router 4 |
| Carrousel | Embla Carousel |
| Styles | SCSS (Sass) |
| Linting | ESLint + Stylelint |
| Package manager | pnpm |

## Accéder à l'expérience
> [!NOTE]
> Le site est fait pour un écran 4k de 1m50 x 1m, lisez [#Simulation de l'écran tactile du MusBA](#simulation-de-lécran-tactile-du-musba) ci-dessous

Aller sur [ A COMPLETER ]



## Simulation de l'écran tactile du MusBA

Vous n'avez peut-être pas d'écran 4k de 1m50 x 1m.
Vous pouvez simuler cette qualité sur chrome en ouvrant l'inspecteur d'élément et en définissant une taille d'écran personnalisée : 3840 x 2160 pixels
Tuto vidéo : [tuto-custom-screen.mp4](https://drive.google.com/file/d/13nn7Nf9MTph6T_OHQdIMjQydiNKbts94/view?usp=sharing)

## Filtrage Tactile (Anti-Missclick)

Cette mise à jour introduit une couche logicielle de détection intelligente des contacts. Elle garantit que seules les interactions volontaires (doigts) sont traitées, filtrant ainsi les erreurs fréquentes sur les grands écrans.

### 1. Contexte & Problématique

Pourquoi ce changement ?
Sur les tables tactiles à technologie Infrarouge, contrairement aux smartphones capacitifs, tout objet coupant les faisceaux lumineux est considéré comme un "clic".

**Problème** : Manches de vêtements, paumes de main, ou objets posés déclenchent des actions indésirables.
**Solution** : Une analyse logicielle de l'empreinte du contact (forme et taille) avant validation.

### 2. Logique de Détection

Le filtrage repose sur deux critères mathématiques stricts situés dans `src/utils/touch/`.

**Critère A : Le Rayon (Radius)**
Vérifie la taille physique de la zone de contact.
- **Zone Valide** : Entre 10px et 50px.
- **Rejeté** :
    - Trop petit (< 10px) : Pointe de stylo, ongle.
    - Trop grand (> 50px) : Paume, bras, objet large.

**Critère B : Le Ratio (Forme)**
Vérifie la proportion largeur/hauteur de l'empreinte.
- **Forme Valide** : Ronde ou légèrement ovale.
- **Rejeté** : Formes trop allongées (Ratio > 1.7 ou < 0.5).

### 3. Architecture des Fichiers ("Le Cerveau")

| Fichier | Rôle |
| :--- | :--- |
| `src/utils/touch/touch.ts` | Point d'entrée. Contient `firstFingerOfEvent`. Trie les points de contact et renvoie le premier qui est valide. |
| `src/utils/touch/fingerTouchRecognition/byRadius.ts` | Calculs. Contient la logique mathématique pour valider le rayon et le ratio. |
| `src/utils/touch/fingerTouchRecognition/byPression.ts` | Optionnel. Permet de filtrer par la force de pression (si le hardware le supporte). |

### 4. Composants Impactés

La sécurité a été déployée sur l'ensemble des interactions critiques :
**La Carte (Map.vue)** : Empêche le déplacement ou l'ouverture de ville lors d'un appui accidentel (ex: main posée).
**Boutons (Button.vue & NavButton.vue)** : Protégés contre les déclenchements involontaires.
**Images (ClickImg.vue)** : Les zones interactives ignorent les contacts informes.
**Carrousel (Carousel.vue)** : Navigation et mode plein écran sécurisés.

### 5. Guide d'Implémentation (Best Practices)

 **Règle d'or pour l'équipe**
Pour toute nouvelle interaction tactile :
 Évitez `v-on:click` ou `@click` (souvent simulé et instable sur infrarouge).
 Utilisez `@touchstart` couplé à la fonction utilitaire.

**Exemple de code standard**
Voici le pattern à utiliser dans vos composants :

```typescript
import { firstFingerOfEvent } from "@/utils/touch/touch";

const handleTouch = (event: TouchEvent) => {
  // 1. Filtrage : "Est-ce un vrai doigt ?"
  const finger = firstFingerOfEvent(event);

  if (!finger) {
    return; // Ce n'est pas un doigt valide, on arrête tout.
  }

  // 2. Action : Exécuter la logique si le filtre est passé
  doSomething();

  // 3. Sécurité : Empêcher les comportements natifs (zoom, scroll, double tap)
  if (event.cancelable) event.preventDefault();
}
```

## Données (Strapi CMS)

Le contenu de la carte (continents, villes, musées, œuvres) est chargé depuis `/public/content/content.json`, exporté depuis un CMS Strapi.

La structure JSON attendue :

```
data: [
  {
    Name: "europe",
    cities: [
      {
        slug: "paris",
        x: ..., y: ...,
        museums: [
          {
            slug: "musee-dupas",
            x: ..., y: ...,
            artworks: [ ... ]
          }
        ]
      }
    ]
  },
  { Name: "amérique", cities: [ ... ] }
]
```

## Routes

| URL | Vue |
| :--- | :--- |
| `/` | Carte (vue Europe par défaut) |
| `/:continentSlug` | Carte zoomée sur un continent |
| `/:continentSlug/:citySlug` | Carte zoomée sur une ville |
| `/:continentSlug/:citySlug/:museumSlug` | Fiche musée / liste des œuvres |
| `/:continentSlug/:citySlug/:museumSlug/:artworkSlug` | Détail d'une œuvre |
| `/all-artworks` | Galerie de toutes les œuvres |
| `/credits` | Page crédits |

## Architecture des composants principaux

| Composant | Rôle |
| :--- | :--- |
| `Map.vue` | Scène Three.js – carte WebGL interactive avec pins et navigation |
| `Infos.vue` | Fiche d'un musée avec liste des œuvres |
| `artworkDetails.vue` | Détail d'une œuvre (carrousel, textes, images zoomables) |
| `ViewAllArtworks.vue` | Galerie complète de toutes les œuvres |
| `Carousel.vue` | Carrousel générique (Embla) |
| `ClickImg.vue` | Image interactive avec zoom / plein écran |
| `Listing.vue` | Liste d'items (œuvres, musées…) |
| `SmartNavbar.vue` | Barre de navigation contextuelle |
| `IdleView.vue` | Détection d'inactivité → reset vers l'accueil |
| `CreditsOverlay.vue` | Overlay crédits |

## Développement

```bash
# 1. Installer pnpm si vous ne l'avez pas, un meilleur package manager que npm
npm i -g pnpm

# 2. Cloner le projet
git clone https://github.com/nuit-musee-musba/experience-2026.git

# 3. Ouvrir le projet et installer les dépendances
cd experience-2026
pnpm i

# 4. Lancer le serveur de dev
pnpm dev
```

## Comment travailler

1. Créez une branche depuis `develop`
2. Faites des commits de l'avancement de votre projet sur cette branche
3. Une fois la feature ou le fix finis faites une pull request dans `develop` (n'oubliez pas de la passer en base de la PR)
4. Essayer de checker régulièrement si des PR sont ouvertes pour les valider et lancer le merge vers `develop`

### Review une pull request

- Pour review une PR, vous avez juste à cliquer sur une d'entre elle, regarder le code ajouté ou supprimer et laisser des commentaires si besoin (oubli, erreur...)
- Si rien ne vous semble problématique, vous pouvez lancer le merge vers develop
- Si vous avez laissé des commentaires, c'est à l'auteur de la PR de les corriger 

### Corriger une pull request
- Vous avez reçu des commentaires sur votre PR, si ils sont pertinents, corriger votre code et faites un nouveau commit sur la branche concernée
- Si vous avez une remarque à apporter, laisser une réponse dans la conversation 

## Mettre en production

Pour envoyer en production, créez une PR pour merger `develop` dans `main`.

Une fois mergé, la CI lancera automatiquement :

- le build du bundle
- le déploiement sur Netlify

**Ce qui est sur `main` est en production, ce qui est sur `develop` non !**

## Les branches

### Nommage

[g-"numéro du groupe"]/`feature/*` (fonctionnalité) ou `fix/*` (correction de bug)/ expliquatif 


exemple : g-1/feature/dragAndDrop

### créer une branche depuis VsCode

- assurez-vous d'être dans `develop`
- lancer un `git pull`pour être sûr d'avoir la dernière version
- git checkout -b nom_de_la_branche

exemple : git checkout -b g1/feature/dragAndDrop

vous pouvez vérifier que vous êtes bien sur la bonne branch en regardant en bas à gauche de VsCode ou en faisant un `git branch`




### Pourquoi travailler sur develop puis merger sur main ?

- on a une branche de travail et de test (`develop`), et une branche de production (`main`)
- à chaque commit sur `main` un build se lance pour déployer le nouveau bundle et le nouveau site, c'est bien de ne pas lancer un build à chaque commit

## Les commits

### Nommer les commits

Nous utilisons la convention "Conventional Commits", disponible ici : [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

Ainsi les commits sont nommés comme ceci : `<type>[optional scope]: <description>`

Le type est défini comme ceci : `feat` pour une nouvelle feature, `fix` pour une correction, `chore` pour de la configuration.

Par exemple, je souhaite ajouter le footer, je ferais :

`feat: ajoute le footer`

S'il y a un problème dans ce dernier, mais que mon commit est déjà passé alors je fais :

`fix: corrige le footer`

Ici, ce sont des exemples simplistes, il faut essayer d'être précis dans les messages (tout en restant concis) pour comprendre la fonction du code en un coup d'œil.'

## Architecture des dossiers

### À la racine `/src/`

C'est le hub qui amène aux expériences (accessible sur http://localhost:4173/).

### Dans `/src/experiences`

Les expériences, chacune dans son dossier. Vous pouvez gérer ce qu'il y a dedans comme vous le souhaitez.
**Pensez à ajouter vos fichiers index.html dans la config `vite.config.js` pour qu'ils soient dans le build**
**Pensez également à ajouter le fichier style.scss dans vos fichiers html**

### Dans `/public`

Les fichiers qui ne sont pas traités par vite (donc autre que js et css en gros)
Exemple : image, fichier 3D

Chaque groupe à son dossier, libre à vous de créer des sous dossiers `/public/1-hub/images`

### À la racine `/`

Les fichiers de config


## Tester les builds

### Sur le build en production

- hébergement distant : aller sur [ A COMPLETER ]
- hébergement local : récupérer le bundle.zip puis suivre les étapes ci-dessous

### Sur votre propre build

Pas besoin de merger sur main et d'attendre que la ci se termine pour tester votre fonctionnalité en dev :

```bash
# Build le dossier dist pour l'hébergement distant
pnpm build

# Build le dossier bundle/ pour l'hébergement local
pnpm bundle

# Ou build le fichier bundle.zip pour l'hébergement local
pnpm bundle:zip
```

### Démarrer le bundle d'hébergement local

1. Récupérer ou build le bundle.zip
2. Unziper le fichier
3. Dans le dossier, éxécuter le script de démarrage correspondant à l'OS (double clic par exemple)
4. Aller sur http://localhost:3000/

### Quelques crédits

Ce Readme est (beaucoup) inspiré du readme des projets précédents, tout comme l'architecture de base (pnpm, vite, etc.), merci à eux ! <3
