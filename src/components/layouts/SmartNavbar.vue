<template>
  <nav class="nav">
    <div class="nav-buttons">
      <Button v-if="showSelectionButtons" color="primary" icon-only icon-primary @click="router.push('/europe')">
        <template #icon-primary>
          <IconMap />
        </template>
      </Button>

      <Button v-if="backTarget && showSelectionButtons" color="secondary" icon-primary :text-content="backLabel"
              @click="router.push(backTarget)">
        <template #icon-primary>
          <IconPin />
        </template>
      </Button>
    </div>

    <div class="nav-buttons" v-if="currentList.length > 1">
      <Button 
        :color="contextColor"
        icon-primary
        :text-content="prevLabel"
        @click="navigate(-1)"
        v-if="enablePrevious">
        <template #icon-primary>
          <IconArrowLeft />
        </template>
      </Button>

      <Button
        :color="contextColor"
        icon-secondary
        :text-content="nextLabel"
        @click="navigate(1)"
        v-if="enableNext">
        <template #icon-secondary>
          <IconArrowRight />
        </template>
      </Button>
    </div>
    <Button class="galery-button" color="artwork" icon-only icon-primary @click="goGallery">
      <template #icon-primary>
        <IconGallery />
      </template>
    </Button>
  </nav>
</template>

<script setup>

// Doc pour les futurs dev à passer ici :

// Ici, on fait trois grandes étapes -> on trouve dans quel niveau on est (continent, ville, muséum), puis on définit la navigation entre les différents éléments :

// Si je suis au niveau continent -> je navigue entre les différents continents
// Si je suis au niveau d'une ville -> je navigue entre les musées de cette ville
// Si je suis au niveau d'un musée -> je navigue entre les œuvres de ce musée

// Enfin, on permet l'affichage du bon label en fonction du niveau, ainsi que des bonnes valeurs dans les boutons.


import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { allData } from '@/store.js';
import Button from '../buttons/Button.vue';
import IconMap from '../icons/IconMap.vue';
import IconPin from '../icons/IconPin.vue';
import IconArrowLeft from '../icons/IconArrowLeft.vue';
import IconArrowRight from '../icons/IconArrowRight.vue';
import IconGallery from '../icons/IconGallery.vue';

const route = useRoute();
const router = useRouter();

// Défini le niveau à l'aide de l'URL

const isArtwork = computed(() => !!route.params.artworkSlug); //si j'ai bien l'URL au complet continent/ville/musée/œuvre
const isMuseum = computed(() => !!route.params.museumSlug && !isArtwork.value); // Si j'ai bien continent/ville/musée, mais pas l'œuvre après
const isCity = computed(() => !!route.params.citySlug && !isMuseum.value && !isArtwork.value); // Si j'ai bien continent/ville, mais pas le musée après
const isContinent = computed(() => !!route.params.continentSlug && !route.params.citySlug); // Si j'ai bien un continent d'ans l'URL, mais pas la ville après

const showSelectionButtons = computed(() => {
  return isCity.value || isMuseum.value || isArtwork.value;
});

// Trouver le continent actuel

const currentContinent = computed(() => {
  if (!allData.value) return null;
  return allData.value.find(continent => continent.Name.toLowerCase() === route.params.continentSlug);
});

// Trouver la ville actuelle dans le continent

const currentCity = computed(() => {
  if (!currentContinent.value) return null;
  return currentContinent.value.cities.find(v => v.slug === route.params.citySlug);
});

// Trouver le musée actuel dans la ville

const currentMuseum = computed(() => {
  if (!currentCity.value) return null;
  return currentCity.value.museums.find(m => m.slug === route.params.museumSlug);
});

// Une ville qui n'a qu'un seul musée : la vue ville est sautée à l'aller,
// donc le retour doit la sauter aussi pour éviter un rezoom inutile sur la ville.
const cityHasSingleMuseum = computed(() => currentCity.value?.museums?.length === 1);

const allCities = computed(() => {
  let cities = [];
  allData.value?.forEach(continent => {
    continent.cities.forEach(city => {
      cities.push({
        ...city,
        path: (`/${continent.Name}/${city.slug}`).toLowerCase(),
      });
    });
  });
  return cities;
});

// en fonction de mon niveau, je me mets dans la liste adéquate (les villes, les musées, les continents etc).

const currentList = computed(() => {
  if (isArtwork.value) return currentMuseum.value?.artworks || [];
  if (isMuseum.value) return currentCity.value?.museums || [];
  if (isCity.value) return allCities.value || []; // Let users navigate through all cities to avoid navigation stucked only on Europe
  if (isContinent.value) return allData.value || [];
  return [];
});

// Je peux du coup définir le label correct, la couleur du bouton et son lien.

const currentIndex = computed(() => {
  // Sécurité : si la liste est vide, on renvoie -1
  if (!currentList.value.length) return -1;

  let slug = '';
  if (isArtwork.value) slug = route.params.artworkSlug;
  else if (isMuseum.value) slug = route.params.museumSlug;
  else if (isCity.value) slug = route.params.citySlug;
  else if (isContinent.value) slug = route.params.continentSlug;

  return currentList.value.findIndex(item => {
    const itemIdentifier = item.slug || item.Name?.toLowerCase();
    return itemIdentifier === slug;
  });
});

// Pour définir la couleur du bouton

const contextColor = computed(() => {
  if (isArtwork.value) return 'artwork';
  if (isMuseum.value) return 'place';
  if (isCity.value) return 'city';
  if (isContinent.value) return 'continent';
});

// Pour définir le label du précédent

const prevLabel = computed(() => {
  const list = currentList.value;
  const idx = currentIndex.value;

  if (!list.length || idx === -1) return "Précédent";

  // Formule pour l'index précédent (on ajoute list.length pour éviter les nombres négatifs)
  const prevIdx = (idx - 1 + list.length) % list.length;
  const target = list[prevIdx];
  const name = target.Name || target.name || target.slug;

  if (isArtwork.value) return `Œuvre précédente`;
  if (isMuseum.value) return name;
  if (isCity.value) return name;
  if (isContinent.value) return name;

  return `Précédent : ${name}`;
});

// Pour définir le label du suivant

const nextLabel = computed(() => {
  const list = currentList.value;
  const idx = currentIndex.value;

  // Sécurité si les données ne sont pas prêtes
  if (!list.length || idx === -1) return "Suivant";

  // Calcul de l'index suivant avec modulo
  const nextIdx = (idx + 1) % list.length;
  const target = list[nextIdx];

  // On récupère le nom (Name pour continent, name ou slug pour le reste)
  const name = target.Name || target.name || target.slug;

  // On adapte le préfixe selon le niveau
  if (isArtwork.value) return `Œuvre suivante`;
  if (isMuseum.value) return name;
  if (isCity.value) return name;
  if (isContinent.value) return name;

  return `Suivant : ${name}`;
});

// Pour définir le label de retour

const backLabel = computed(() => {
  if (isArtwork.value) return `Retour à ${currentMuseum.value?.name}`;
  if (isMuseum.value) {
    // Ville à un seul musée : on retourne directement au continent.
    if (cityHasSingleMuseum.value) return `Retour vers l'${currentContinent.value?.Name}`;
    return `Retour à ${currentCity.value?.name}`;
  }
  if (isCity.value) return `Retour vers l'${currentContinent.value?.Name}`;
  if (isContinent.value) return `Retour à la carte`;
});

// Pour définir le lien de retour :

const backTarget = computed(() => {
  if (isArtwork.value) {
    return `/${route.params.continentSlug}/${route.params.citySlug}/${route.params.museumSlug}`;
  } if (isMuseum.value) {
    // Ville à un seul musée : on saute la vue ville au retour.
    if (cityHasSingleMuseum.value) {
      return `/${route.params.continentSlug}`;
    }
    return `/${route.params.continentSlug}/${route.params.citySlug}`;
  } if (isCity.value) {
    return `/${route.params.continentSlug}`;
  } if (isContinent.value) {
    return `/europe`;
  }

  return null;
});

const enablePrevious = computed(() => {
  return currentIndex.value > 0;
});

const enableNext = computed(() => {
  return currentIndex.value < currentList.value?.length - 1;
});

const navigate = (direction) => {
  const list = currentList.value;
  const idx = currentIndex.value;

  if (!list.length || idx === -1) return;

  const nextIndex = (idx + direction + list.length) % list.length;
  const target = list[nextIndex];

  let path = '';
  if (isArtwork.value) { path = `/${route.params.continentSlug}/${route.params.citySlug}/${route.params.museumSlug}/${target.slug}`; }
  else if (isMuseum.value) { path = `/${route.params.continentSlug}/${route.params.citySlug}/${target.slug}`; }
  else if (isCity.value) { path = target.path; }
  else if (isContinent.value) { path = `/${target.Name.toLowerCase()}`; }

  router.push(path);
};

const goGallery = () => {
  router.push('/all-artworks');
};
</script>

<style lang="scss" scoped>
.nav {
  display: flex;
  gap: 12px;
  padding: 8px 14px;
  border-top: 2px solid $black;
  background: white;
  z-index: 1000;
  width: 100%;
  position: fixed;
  bottom: 0;
}

.nav-buttons {
  display: flex;
  gap: 8px;

  &:first-child {
    margin-right: auto;
  }
}

.galery-button {
  margin-left: 12px;
}
</style>