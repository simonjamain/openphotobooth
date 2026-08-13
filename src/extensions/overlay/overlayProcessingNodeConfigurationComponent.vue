<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { OverlayProcessingNodeConfiguration } from "./overlayProcessingNodeConfiguration";

const configuration = defineModel<OverlayProcessingNodeConfiguration["configuration"]>("configuration", {
  default: () => ({
    overlayImageDataUrl: null,
    zones: []
  })
});

const previewImageDataUrl = ref<string | null>(null);
const previewRef = ref<HTMLDivElement | null>(null);
const draftZone = ref<{ x: number; y: number; width: number; height: number } | null>(null);
const isDragging = ref(false);

function ensureConfigurationState() {
  if (configuration.value === undefined) {
    configuration.value = {
      overlayImageDataUrl: null,
      zones: []
    };
  }

  if (configuration.value.zones === undefined) {
    configuration.value.zones = [];
  }

  return configuration.value;
}

const currentConfiguration = computed(() => ensureConfigurationState());

watch(
  () => currentConfiguration.value.overlayImageDataUrl,
  (overlayImageDataUrl) => {
    previewImageDataUrl.value = overlayImageDataUrl ?? null;
  },
  { immediate: true }
);

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  const currentConfig = ensureConfigurationState();

  if (file === undefined) {
    currentConfig.overlayImageDataUrl = null;
    previewImageDataUrl.value = null;
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    currentConfig.overlayImageDataUrl = reader.result as string;
    previewImageDataUrl.value = reader.result as string;
  };
  reader.readAsDataURL(file);
}

function onPointerDown(event: PointerEvent) {
  if (previewImageDataUrl.value === null || previewRef.value === null) {
    return;
  }

  const bounds = previewRef.value.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width;
  const y = (event.clientY - bounds.top) / bounds.height;

  draftZone.value = { x, y, width: 0, height: 0 };
  isDragging.value = true;
}

function onPointerMove(event: PointerEvent) {
  if (!isDragging.value || draftZone.value === null || previewRef.value === null) {
    return;
  }

  const bounds = previewRef.value.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width;
  const y = (event.clientY - bounds.top) / bounds.height;

  draftZone.value = {
    x: draftZone.value.x,
    y: draftZone.value.y,
    width: Math.max(0, x - draftZone.value.x),
    height: Math.max(0, y - draftZone.value.y)
  };
}

function onPointerUp() {
  if (!isDragging.value || draftZone.value === null) {
    return;
  }

  const zone = draftZone.value;
  const normalizedZone = {
    x: Math.min(zone.x, zone.x + zone.width),
    y: Math.min(zone.y, zone.y + zone.height),
    width: Math.abs(zone.width),
    height: Math.abs(zone.height)
  };

  if (normalizedZone.width >= 0.02 && normalizedZone.height >= 0.02) {
    ensureConfigurationState().zones.push(normalizedZone);
  }

  draftZone.value = null;
  isDragging.value = false;
}

function removeZone(index: number) {
  ensureConfigurationState().zones.splice(index, 1);
}

function clearZones() {
  ensureConfigurationState().zones = [];
}

function getZoneStyle(zone: { x: number; y: number; width: number; height: number }) {
  return {
    left: `${zone.x * 100}%`,
    top: `${zone.y * 100}%`,
    width: `${zone.width * 100}%`,
    height: `${zone.height * 100}%`
  };
}
</script>

<template>
  <div class="overlay-config">
    <p>This node allows you to put an overlay on the photos taken by the booth. This is useful for adding branding or decorative elements.</p>
    <p>Note that the overlay will be applied on top of the photos, so it has to leave transparent areas.</p>
    <p>If your entry node doesn't supply as many photos as the number of areas you have drawn, it will recycle between photos until all areas are covered. For example this allows you to make sheets of the same photo.</p>
    <p>
      Upload a PNG template and draw the zones where captured images should appear.
    </p>

    <label class="overlay-config__field">
      <span>PNG template</span>
      <input type="file" accept="image/png" @change="onFileSelected" />
    </label>

    <div v-if="previewImageDataUrl !== null" class="overlay-config__preview">
      <div
        ref="previewRef"
        class="overlay-config__canvas"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointerleave="onPointerUp"
      >
        <img :src="previewImageDataUrl" alt="Overlay preview" />

        <div
          v-for="(zone, index) in currentConfiguration.zones"
          :key="`${zone.x}-${zone.y}-${index}`"
          class="overlay-config__zone"
          :style="getZoneStyle(zone)"
          @click.stop="removeZone(index)"
          title="Click to remove"
        />

        <div
          v-if="draftZone !== null"
          class="overlay-config__zone overlay-config__zone--draft"
          :style="getZoneStyle(draftZone)"
        />
      </div>
    </div>

    <p v-else class="overlay-config__helper">
      Select a PNG template to start drawing zones.
    </p>

    <div class="overlay-config__actions">
      <button type="button" @click="clearZones">Clear zones</button>
    </div>
  </div>
</template>

<style scoped>
.overlay-config {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.overlay-config__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.overlay-config__preview {
  display: flex;
  justify-content: center;
}

.overlay-config__canvas {
  position: relative;
  display: inline-block;
  max-width: 100%;
  border: 1px solid #888;
  cursor: crosshair;
  touch-action: none;
}

.overlay-config__canvas img {
  display: block;
  max-width: 100%;
  max-height: 24rem;
}

.overlay-config__zone {
  position: absolute;
  border: 2px solid #ff5b5b;
  background: rgba(255, 91, 91, 0.2);
  box-sizing: border-box;
}

.overlay-config__zone--draft {
  border-style: dashed;
}

.overlay-config__helper {
  margin: 0;
  color: #666;
}

.overlay-config__actions {
  display: flex;
  gap: 0.5rem;
}
</style>
