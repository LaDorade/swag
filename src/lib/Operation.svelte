<script lang="ts">
    import { getOperationAnchor, methodToColor, stringToTailwindColor } from "#lib";
    import Parameters from "./Parameters.svelte";
    import RequestBody from "./RequestBody.svelte";
    import Responses from "./Responses.svelte";

    import type * as oas from "#types/oas.js";


    interface Props {
        operation: {
            path: string,
            method: string,
            operationData: oas.OperationObject;
        };
        open?: boolean;
    }

    let {
        operation,
        open = $bindable(false)
    }: Props = $props()

    let {
        method,
        path,
    } = $derived(operation)
    let {
        summary,
        description,
        tags,
        requestBody,
        parameters = [],
    } = $derived(operation.operationData)

    let responses = $derived(operation.operationData?.responses ?? {})

    let anchor = $derived(getOperationAnchor(method, path))

    let methodColor = $derived(methodToColor(method))

    let tabs = $derived.by(() => {
        const t = [];
        if (parameters?.length)
            t.push({ label: 'Parameters', comp: Parameters, props: { parameters } } as const)
        if (requestBody)
            t.push({ label: 'Request Body', comp: RequestBody, props: { requestBody } } as const)
        if (responses)
            t.push({ label: 'Responses', comp: Responses, props: { responses } } as const)
        return t;
    })
    let activeTab = $derived(tabs[0]?.label ?? '')
</script>

<div
    id={anchor}
    class="text-sm w-full flex flex-col overflow-none bg-gray-50 border border-gray-200 rounded
    target:animate-hightlight"
>
    <button class="h-full w-full p-2 flex items-center gap-2 font-mono
        cursor-pointer {methodColor} border-gray-200 hover:brightness-90"
        title={summary ?? path}
        class:border-b={open}
        onclick={() => open = !open}>
        <span class="text-base uppercase w-20">{method}</span>
        <span class="border-l border-gray-300 h-6"></span>
        <div class="pl-2 py-0.5 text-left text-nowrap w-full flex items-baseline gap-2 bg-geray-50 rounded overflow-hidden">
            <span class="font-bold">{path}</span>
            <i class="px-0.5 text-xs text-gray-600 italic truncate w-full">{summary}</i>
            <span class="text-gray-600 ml-auto pr-2">{open ? '▲' : '▼'}</span>
        </div>
    </button>

    {#if open}
        <div class="flex flex-col">
            {#if description}
                <div class="p-2 leading-6 flex text-center border-b border-gray-200">
                    <span class="italic text-gray-600">
                        {description}
                    </span>
                </div>
            {/if}
            <div class="flex items-baseline text-center border-b border-gray-200">
                {#each tabs as tab (tab.label)}
                    {@const { label } = tab}
                    {@const active = activeTab === label}
                    <button onclick={() => activeTab = label}
                        class="leading-6 p-2 flex flex-col gap-2
                        {active ? 'bg-gray-100' : ''} cursor-pointer hover:bg-gray-100">
                        {label}
                    </button>
                {/each}
                {#if tags?.length}
                    <div class="flex items-baseline gap-2 px-2 ml-auto">
                        {#each tags as tag (tag)}
                            <span class="flex items-baseline bg-gray-100 px-2 py-1
                                text-xs {stringToTailwindColor(tag)}
                                rounded-xl border border-gray-200">
                                {tag}
                            </span>
                        {/each}
                    </div>
                {/if}
            </div>
            {#if activeTab}
                {@const tab = tabs.find(t => t.label === activeTab) ?? null}
                {#if tab}
                    <div class="p-2">
                        <tab.comp {...tab.props} open />
                    </div>
                {/if}
            {/if}
        </div>
    {/if}
</div>
