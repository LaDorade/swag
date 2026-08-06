<script lang="ts">
    interface Props {
      requestBody: object
      open?: boolean;
    }

    let {
      requestBody,
      open = $bindable(false)
    }: Props = $props()
</script>

<details bind:open class="p-1 flex flex-col gap-2 border rounded border-gray-200">
    <summary class="text-lg">
        RequestBody
    </summary>
    {JSON.stringify(requestBody, null, 2)}
</details>
