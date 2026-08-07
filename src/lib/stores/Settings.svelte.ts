class Settings {
    /**
     * Resolution du sous-schéma des arrays, même quand il s'agit d'une $ref
     */
    alwaysResolveArray = $state<boolean>(true)

    schemaMaxResolutionDepth = $state<number>(3)
}

export const settings = new Settings()
