<script lang="ts">
    import { getColorFromResolutionType, getSchemaAnchor } from "#lib";
    import type { ResolutionType } from "#lib/stores/Resovler.svelte.js";

    interface Props {
        ref?: string | undefined | null;
        resolutionType: ResolutionType;
    }
    let { ref, resolutionType }: Props = $props();

    let color = $derived(getColorFromResolutionType(resolutionType))
</script>

{#if resolutionType !== 'inline' && ref}
    <span class="inline-block text-xs italic {color}">
        {#if resolutionType === 'unresolved'}
            -&rsaquo; {ref} (unresolved)
        {:else}
            <a
                onclick={e => e.stopPropagation()}
                href="#{getSchemaAnchor(ref)}"
                class="hover:underline"
            >-&rsaquo; {ref} {resolutionType === 'maxDepth' ? '(max depth)' : ''}</a>
        {/if}
    </span>
{/if}
