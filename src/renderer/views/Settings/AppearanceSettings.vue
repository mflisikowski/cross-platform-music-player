<script setup lang="ts">
import { amethyst } from "@/amethyst";
import SettingsSetting from "@/components/settings/SettingsSetting.vue";
import DropdownInput from "@/components/v2/DropdownInput.vue";
import SliderInput from "@/components/v2/SliderInput.vue";
import ToggleSwitch from "@/components/v2/ToggleSwitch.vue";
import { BLEND_MODES, FONT_WEIGHTS } from "@shared/constants";

const AVAILABLE_THEMES = [
  "amethyst-dark",
  "emerald-dark",
  "onyx-dark", // is missing css variables
  "rose-dark", // is missing css variables
  "ruby-dark", // is missing css variables
  "sapphire-dark" // is missing css variables
];

</script>

<template>
  <settings-setting
    :title="$t('settings.animation_duration.title')"
    :description="$t('settings.animation_duration.description')"
    icon="ic:twotone-access-time"
  >
    <slider-input
      v-model="amethyst.state.settings.value.animationDuration"
      :min="0"
      :max="300"
      :step="10"
      suffix="ms"
    />
  </settings-setting>
  <settings-setting
    :title="$t('settings.font_weight.title')"
    :description="$t('settings.font_weight.description')"
    icon="ic:twotone-format-bold"
  >
    <dropdown-input
      v-model="amethyst.state.settings.value.fontWeight"
      :options="FONT_WEIGHTS"
    />
  </settings-setting>
  <settings-setting
    :title="$t('settings.theme.title')"
    :description="$t('settings.theme.description')"
    icon="ic:twotone-palette"
  >
    <dropdown-input
      v-model="amethyst.state.settings.value.theme"
      :options="AVAILABLE_THEMES"
    />
  </settings-setting>
  <settings-setting
    :title="$t('settings.ambient_background.title')"
    :description="$t('settings.ambient_background.description')"
    icon="ic:twotone-photo-size-select-actual"
  >
    <toggle-switch
      v-model="amethyst.state.settings.value.showAmbientBackground" 
    />
    <template #subsettings>
      <div class="p-2 flex flex-col gap-2">
        <settings-setting
          subsetting
          :title="$t('settings.ambient_background.blending_mode.title')"
          :description="$t('settings.ambient_background.blending_mode.description')"
          icon="ic:twotone-water-drop"
        >
          <dropdown-input
            v-model="amethyst.state.settings.value.ambientBackgroundBlendMode"
            :options="BLEND_MODES"
          />
        </settings-setting>
        <settings-setting
          subsetting
          :title="$t('settings.ambient_background.spin.title')"
          :description="$t('settings.ambient_background.spin.description')"
          icon="ic:twotone-rotate-90-degrees-ccw"
        >
          <toggle-switch
            v-model="amethyst.state.settings.value.ambientBackgroundSpin" 
          />
        </settings-setting>
        <settings-setting
          subsetting
          :title="$t('settings.ambient_background.spin_speed.title')"
          :description="$t('settings.ambient_background.spin_speed.description')"
          icon="ic:twotone-rotate-90-degrees-ccw"
        >
          <slider-input
            v-model="amethyst.state.settings.value.ambientBackgroundSpinSpeed"
            :min="0"
            :max="60"
            :step="1"
            suffix="sec/spin"
          />
        </settings-setting>
        <settings-setting
          subsetting
          :title="$t('settings.ambient_background.opacity.title')"
          :description="$t('settings.ambient_background.opacity.description')"
          icon="ic:twotone-opacity"
        >
          <slider-input
            v-model="amethyst.state.settings.value.ambientBackgroundOpacity"
            :min="0"
            :max="100"
            :step="2.5"
            suffix="%"
          />
        </settings-setting>
        <settings-setting
          subsetting
          :title="$t('settings.ambient_background.blur_strength.title')"
          :description="$t('settings.ambient_background.blur_strength.description')"
          icon="ic:twotone-blur-linear"
        >
          <slider-input
            v-model="amethyst.state.settings.value.ambientBackgroundBlurStrength"
            :min="0"
            :max="128"
            :step="4"
            suffix="px"
          />
        </settings-setting>
        <settings-setting
          subsetting
          :title="$t('settings.ambient_background.zoom.title')"
          :description="$t('settings.ambient_background.zoom.description')"
          icon="ic:twotone-zoom-in"
        >
          <slider-input
            v-model="amethyst.state.settings.value.ambientBackgroundZoom"
            :min="50"
            :max="250"
            :step="10"
            suffix="%"
          />
        </settings-setting>
      </div>
    </template> 
  </settings-setting>
  <settings-setting
    :title="$t('settings.neon_mode.title')"
    :description="$t('settings.neon_mode.description')"
    icon="ic:twotone-remove-red-eye"
  >
    <toggle-switch
      v-model="amethyst.state.settings.value.neonMode" 
    />
  </settings-setting>
  <settings-setting
    :title="$t('settings.playback_controls.title')"
    :description="$t('settings.playback_controls.description')"
    icon="ic:twotone-skip-next"
  >
    <toggle-switch
      v-model="amethyst.state.settings.value.showPlaybackControls" 
    />
  </settings-setting>
  <settings-setting
    :title="$t('settings.minimalist_mode.title')"
    :description="$t('settings.minimalist_mode.description')"
    icon="ic:twotone-remove-red-eye"
  >
    <toggle-switch
      v-model="amethyst.state.settings.value.minimalistMode" 
    />
    <template #subsettings>
      <div class="p-2 flex flex-col gap-2">
        <settings-setting
          subsetting
          :title="$t('settings.minimalist_mode.hide_category_titles.title')"
          :description="$t('settings.minimalist_mode.hide_category_titles.description')"
          icon="ic:twotone-format-strikethrough"
        >
          <toggle-switch
            v-model="amethyst.state.settings.value.hideCategoryTitles" 
          />
        </settings-setting>
      </div>
    </template>
  </settings-setting>
  
  <settings-setting
    :title="$t('settings.cover_art.title')"
    :description="$t('settings.cover_art.description')"
    icon="ic:twotone-image"
  >
    <toggle-switch
      v-model="amethyst.state.settings.value.showCoverArt" 
    />
  </settings-setting>
  <settings-setting
    :title="$t('settings.debug_stats.title')"
    :description="$t('settings.debug_stats.description')"
    icon="ic:twotone-bug-report"
  >
    <toggle-switch
      v-model="amethyst.state.settings.value.showDebugStats" 
    />
  </settings-setting>
</template>