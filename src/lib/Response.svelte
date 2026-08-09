<script lang="ts">
    import type { ResponseObject } from "#types/oas.js";


    interface Props {
        response: ResponseObject & {
            code: string;
        },
        open?: boolean;
    }

    let {
        response,
        open = $bindable(false)
    }: Props = $props()

    let foldable = $derived(
        Boolean(response.summary || response.content)
    )
</script>

<details bind:open class="border-gray-300">
    <summary class="leading-6 text-left w-full flex items-baseline gap-2 rounded overflow-hidden">
        <span class="font-bold">{response.code}</span>
        <i class="px-0.5 text-xs text-gray-600 italic truncate">{response.description}</i>
        {#if foldable}<span class="text-gray-600">{open ? '▲' : '▼'}</span>{/if}
    </summary>
    {#if foldable}
        {JSON.stringify(response.content, null, 2)}
    {/if}
</details>
