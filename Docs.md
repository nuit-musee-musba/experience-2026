# documentation

## Mettre à jour le contenu du strapi
### Si vous avez un compte administrateur sur strapi
Vous pouvez mettre à jour le contenu directement depuis [l'interface administrateur de strapi](https://useful-car-6cfb564836.strapiapp.com/admin).

**Attention, si vous modifiez le contenu, il n'y a pas de retour en arrière**

### Si vous n'avez pas de compte administrateur sur strapi
Vous pouvez contacter par mail [billel.tighidet@mmibordeaux.com](mailto:billel.tighidet@mmibordeaux.com) pour demander un compte administrateur.


## Mettre à jour les données de l'expérience
Une fois que vous avez mis à jour le contenu depuis strapi, vous devez exporter le JSON.

1. Ouvrir le [lien d'export de strapi](https://useful-car-6cfb564836.strapiapp.com/api/continents?sort=id:DESC&populate[cities][populate][museums][populate][images]=true&populate[cities][populate][museums][populate][artworks][populate][images][populate]=*)
2. copier le contenu
3. coller dans le fichier `public/content/content.json`
4. créer un commit portant le nom `update content`
5. envoyer sur la branche `main`

**Il est important d'avoir continents?Sort=id:DESC dans l'url sinon l'Amérique arrive en premier**
