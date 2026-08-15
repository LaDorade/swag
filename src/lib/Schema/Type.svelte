<script lang="ts">
    import Type from "./Type.svelte"
    import Ref from "./Ref.svelte";
    import { settings } from "#lib/stores/Settings.svelte.js";

    import type { ResolutionType } from "#lib/stores/Resovler.svelte.js";
    import { typeToColor } from "#lib";

    interface Props {
        rootData: {
            type: string | undefined | null;
            ref: string | undefined | null;
            resolutionType: ResolutionType;
        };
        innerData?: {
            type: string | undefined | null;
            ref: string | undefined | null;
            resolutionType: ResolutionType;
        } | null | undefined;
    }

    let {
        rootData,
        innerData,
    }: Props = $props();

    let color = $derived(typeToColor(rootData.type ?? ''))
</script>

<span class="inline-block font-medium">
    <span class="text-sm italic font-mono {color}">
        {rootData.type}
    </span>{#if innerData}
        <span class="inline-block text-xs font-bold text-gray-700">&#x3008;<Type rootData={innerData} />&#x3009;</span>
    {/if}
    {#if rootData.resolutionType !== 'resolved' || settings.display.showResolvedReferences}
        <Ref ref={rootData.ref} resolutionType={rootData.resolutionType} />
    {/if}
</span>
