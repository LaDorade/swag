class Settings {
    resolution = $state({
        /**
         * Resolution du sous-schéma des arrays, même quand il s'agit d'une $ref
         * Si oui, ne compte pas dans le décompte de la profondeur maximale de résolution des sous-schémas
         * @see {@link Settings.resolution.schemaMaxResolutionDepth}
         */
        alwaysResolveArraySubSchema: true,
        /**
         * Profondeur maximale de résolution des sous-schémas
         * Chaque résolution (resolutionType: 'resolved') décrémente ce compteur pour le
         * schéma en cours de résolution
         */
        schemaMaxResolutionDepth: 3,
        /**
         * Profondeur maximale de résolution des références directes
         * @deprecated Ce paramètre va disparaître au profit d'un test de référence circulaire
         */
        forwardReferenceMaxDepth: 3,
    })

    display = $state({
        /**
         * Afficher les lignes d'items dans les arrays
         * Ajoute une ligne "Items:" qui wrap les items de l'array
         */
        showItemsLineOnArray: false,
        /**
         * Afficher les chemins des propriétés dans les schémas
         */
        showPropertiesPaths: true,
    })
}

export const settings = new Settings()
