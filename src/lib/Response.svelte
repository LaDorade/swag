<script lang="ts">
    interface Props {
        response: {
            code: string;
            summary?: string;
            description?: string;
            headers?: Record<string, unknown>;
            content?: Record<string, unknown>;
            links?: Record<string, unknown>;
        },
        open?: boolean;
    }
    let {
        response,
        open = $bindable(false)
    }: Props = $props()
</script>

<details bind:open class="not-last:border-b border-gray-300 pb-2 pt-2">
    <summary class="flex items-center gap-2 font-mono">
        <span
            class="h-fit px-2 py-1 text-sm rounded-lg bg-green-100"
        >{response.code}</span>
        {#if response.summary}
            <span>{response.summary}</span>
        {:else if response.description}
            <span>{response.description}</span>
        {/if}
        {#if open}
            A
        {:else}
            V
        {/if}
    </summary>
    {#if response.description}
        <span>{response.description}</span>
    {/if}
    {#if response.content}
        {JSON.stringify(response.content, null, 2)}
    {/if}
</details>
