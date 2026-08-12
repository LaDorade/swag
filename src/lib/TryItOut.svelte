<script lang="ts">
    import { specStore } from "./stores/Spec.svelte";

    import type { Operation } from "#types";

    interface Props {
        operation: Operation
    }
    let {
        operation,
    }: Props = $props();

    let servers = $derived(specStore.getOperationServers(operation.path, operation.method));
</script>

{#each servers as server (server.url)}
    <div>{server.url}</div>
{/each}
