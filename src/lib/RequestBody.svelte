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

<div class="leading-6">
    {JSON.stringify(requestBody, null, 2)}
</div>
