<script lang="ts">
    import { getColorFromResolutionType, getSchemaAnchor } from "#lib";
    import type { ResolutionStatus } from "#lib/openApi/resolveObject.js";

    interface Props {
        ref?: string | undefined | null;
        status: ResolutionStatus;
    }
    let { ref, status }: Props = $props();

    let color = $derived(getColorFromResolutionType(status))
</script>

{#if status !== 'inline' && ref}
    <span class="inline-block text-xs italic {color}">
        {#if status === 'unresolved'}
            -&rsaquo; {ref} (unresolved)
        {:else}
            <a
                onclick={e => e.stopPropagation()}
                href="#{getSchemaAnchor(ref)}"
                class="hover:underline"
            >-&rsaquo; {ref} {status === 'maxDepth' ? '(max depth)' : ''}</a>
        {/if}
    </span>
{/if}
