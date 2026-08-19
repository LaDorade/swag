<script lang="ts">
    import Header from "./Header.svelte";
    import type { HeaderObject, ReferenceObject } from "#types/oas.js";

    interface Props {
        headers: Record<string, HeaderObject | ReferenceObject>
    }

    let { headers }: Props = $props()
</script>

<div class="headers flex flex-col gap-2">
    <h3 class="text-base base font-bold border-b border-gray-200 w-fit">Headers</h3>
    {#each Object.entries(headers) as [name, header] (name)}
        <Header {header} {name} />
    {/each}
</div>
