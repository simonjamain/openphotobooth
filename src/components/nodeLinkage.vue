<script setup lang="ts">
defineProps<{
  displayArrow?: boolean,
}>()
</script>
<template>
    <div class="linkage_fill">
        <div class="linkage_outline linkage_outline--left">
        </div>
        <svg v-if="displayArrow" class="linkage_center" style="fill: var(--color-border);" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            <path
                d="M297.4 598.6C309.9 611.1 330.2 611.1 342.7 598.6L470.7 470.6C479.9 461.4 482.6 447.7 477.6 435.7C472.6 423.7 460.9 416 448 416L384 416L384 80C384 53.5 362.5 32 336 32L304 32C277.5 32 256 53.5 256 80L256 416L192 416C179.1 416 167.4 423.8 162.4 435.8C157.4 447.8 160.2 461.5 169.4 470.6L297.4 598.6z" />
        </svg>
        <div v-else class="linkage_center"></div>
        <div class="linkage_outline linkage_outline--right">  
        </div>
    </div>
</template>
<style scoped>
.linkage_fill {
    background-color: var(--color-surface);
    display: flex;
    flex-direction: row;
    margin: auto;
    width: calc(var(--space-6)*1.2);
    height: calc(var(--space-6)*1.6);
    position: relative;
    z-index: 1;
}
.linkage_center {
    flex-grow: 1;
}
.linkage_outline {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface-muted);
    width: calc(var(--radius-sm));
}
.linkage_outline--left {
    border-left: none;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}
.linkage_outline--right {
    border-right: none;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

</style>