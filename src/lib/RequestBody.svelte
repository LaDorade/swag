<script lang="ts">
    import type { ReferenceObject, RequestBodyObject } from "#types/oas.js";


    interface Props {
      requestBody?: RequestBodyObject | ReferenceObject;
      open?: boolean;
    }

    let {
      requestBody,
      open = $bindable(false)
    }: Props = $props()
</script>

<div class="leading-6">
    {JSON.stringify(requestBody, null, 2)}
</div>
