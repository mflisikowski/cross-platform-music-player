<script setup lang="ts">
import { amethyst } from "@/amethyst";
import BaseToolbar from "@/components/BaseToolbar.vue";
import BaseToolbarButton from "@/components/BaseToolbarButton.vue";
import BaseToolbarSplitter from "@/components/BaseToolbarSplitter.vue";
import { useContextMenu } from "@/components/ContextMenu";
import type { AmethystAudioNode } from "@/logic/audio";
import { getThemeColorHex } from "@/logic/color";
import { AmethystEightBandEqualizerNode, AmethystFilterNode, AmethystGainNode, AmethystPannerNode, AmethystSpectrumNode } from "@/nodes";
import type { Coords } from "@shared/types";
import { Background, BackgroundVariant } from "@vue-flow/additional-components";
import type { Connection, EdgeMouseEvent, NodeDragEvent} from "@vue-flow/core";
import { VueFlow } from "@vue-flow/core";
import { onKeyStroke } from "@vueuse/core";
import { computed, onMounted, onUnmounted, ref } from "vue";
const dash = ref();
const nodeEditor = ref();
type NodeMenuOptions = Coords & {source?: AmethystAudioNode, target?: AmethystAudioNode};

let resizeObserver: ResizeObserver;

onMounted(() => {
  resizeObserver = new ResizeObserver(fitToView);
  resizeObserver.observe(nodeEditor.value);
}); 

onUnmounted(() => {
  resizeObserver.disconnect();
});

// Proxy function because dash.value is innaccessible in template code
const fitToView = () => dash.value.fitView();

const elements = computed({
  get: () => [...amethyst.player.nodeManager.getNodeProperties(), ...amethyst.player.nodeManager.getNodeConnections()],
  set: () => {}
});

const getDashCoords = () => {
  const transformationPane = document.getElementsByClassName("vue-flow__transformationpane")[0]! as HTMLDivElement;
  const style = getComputedStyle(transformationPane);
  const matrix = style.transform;

  // No transform property. Simply return 0 values.
  if (matrix === "none" || typeof matrix === "undefined") {
    return {
      x: 0,
      y: 0,
      z: 0
    };
  }

  // Can either be 2d or 3d transform
  const matrixType = matrix.includes("3d") ? "3d" : "2d";
  const matrixValues = matrix.match(/matrix.*\((.+)\)/)?.[1].split(", ");

  // 2d matrices have 6 values
  // Last 2 values are X and Y.
  // 2d matrices does not have Z value.
  if (matrixType === "2d") {
    return {
      x: parseFloat(matrixValues![4]),
      y: parseFloat(matrixValues![5]),
      z: 0
    };
  }

  // 3d matrices have 16 values
  // The 13th, 14th and 15th values are X, Y and Z
  if (matrixType === "3d") {
    return {
      x: parseFloat(matrixValues![12]),
      y: parseFloat(matrixValues![13]),
      z: parseFloat(matrixValues![14]),
    };
  }

  return {
    x: 0,
    y: 0,
    z: 0
  };
};

const computeNodePosition = ({x, y}: Coords) => {
  const {x: dashX, y: dashY} = getDashCoords();
  return { x: -dashX + x / amethyst.state.settings.value.zoomLevel, y: -dashY + y / amethyst.state.settings.value.zoomLevel};
};

const nodeMenu = ({x, y, source, target}: NodeMenuOptions) => [
  {
    title: "Open File",
    icon: "ic:twotone-file-open",
    action: handleOpenFile,
  },
  {
    title: "Save As",
    icon: "ic:twotone-save-as",
    action: handleSaveFile,
  },
  {
    title: "Add FilterNode",
    icon: "ic:twotone-plus",
    action: () => {
      amethyst.player.nodeManager.addNode(new AmethystFilterNode(amethyst.player.nodeManager.context, computeNodePosition({ x, y })),
      source && target && [source, target]);
    }
  },
  {
    title: "Add EightBandEqualizerNode",
    icon: "ic:twotone-plus",
    action: () => {
      amethyst.player.nodeManager.addNode(new AmethystEightBandEqualizerNode(amethyst.player.nodeManager.context, computeNodePosition({ x, y })), 
      source && target && [source, target]);
    }
  },
  {
    title: "Add PannerNode", 
    icon: "ic:twotone-plus", 
    action: () => {
      amethyst.player.nodeManager.addNode(new AmethystPannerNode(amethyst.player.nodeManager.context, computeNodePosition({ x, y })), 
      source && target && [source, target]);
    }
  },
  {
    title: "Add GainNode", 
    icon: "ic:twotone-plus", 
    action: () => {
      amethyst.player.nodeManager.addNode(new AmethystGainNode(amethyst.player.nodeManager.context, computeNodePosition({ x, y })), 
      source && target && [source, target]);
    }
  },
  {
    title: "Add AmethystSpectrumNode", 
    icon: "ic:twotone-plus", 
    action: () => {
      amethyst.player.nodeManager.addNode(new AmethystSpectrumNode(amethyst.player.nodeManager.context, computeNodePosition({ x, y })), 
      source && target && [source, target]);
    }
  },
  {
    title: "Reset All",
    icon: "ic:twotone-restart-alt",
    action: handleReset,
    red: true,
  },
];

const handleContextMenu = ({y, x}: MouseEvent) => {
  useContextMenu().open({x, y}, nodeMenu({x, y}));
};

const handleEdgeContextMenu = (e: EdgeMouseEvent) => {
  const source = amethyst.player.nodeManager.nodes.value.find(node => node.properties.id === e.edge.source)!;
  const target = amethyst.player.nodeManager.nodes.value.find(node => node.properties.id === e.edge.target)!;

  const {x, y} = (e.event as MouseEvent);
  useContextMenu().open({x, y}, [
    {title: "Remove connection", icon: "ic:twotone-link-off", red: true, action: () => source.disconnectFrom(target)},
    ...nodeMenu({x, y, source, target}),
  ]);
};

const handleNodeDragStop = (e: NodeDragEvent) => {
  amethyst.player.nodeManager.nodes.value.find(node => node.properties.id === e.node.id)?.updatePosition(e.node.position);
};

const handleConnect = (e: Connection) => {
  const from = amethyst.player.nodeManager.nodes.value.find(node => node.properties.id === e.source);
  const to = amethyst.player.nodeManager.nodes.value.find(node => node.properties.id === e.target);

  if (from && to) {
    from.connectTo(to);
  }
};

const handleOpenFile = async () => {
  const result = await amethyst.showOpenFileDialog({filters: [{name: "Amethyst Node Graph", extensions: ["ang"]}]});
  if (result.canceled) return;
  
  fetch(result.filePaths[0])
    .then(response => response.blob())
    .then(blob => {
      return new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(blob);
        reader.onloadend = () => reader.result ? resolve(reader.result as ArrayBuffer) : reject("reader null");
      });
    })
    .then(buffer => {
      const decoder = new TextDecoder("utf-8");
      const jsonString = decoder.decode(buffer);

      // Use the loaded buffer
      amethyst.player.nodeManager.loadGraph(JSON.parse(jsonString), result.filePaths[0]);

      // Fixes volume resetting to 100% when loading a new graph
      amethyst.player.setVolume(amethyst.player.volume.value);
    });
};

const handleSaveFile = async () => {
  const serializedGraph = amethyst.player.nodeManager.serialize();
  const dialog = await amethyst.showSaveFileDialog({
    filters: [{ name: "Amethyst Node Graph", extensions: ["ang"] }],
    defaultPath: amethyst.player.nodeManager.graphName.value || "untitled"
  });
  if (dialog?.canceled || !dialog?.filePath) return;

  return amethyst.writeFile(serializedGraph, dialog?.filePath);
};

const handleReset = () => {
  amethyst.player.nodeManager.reset();
  amethyst.player.setVolume(amethyst.player.volume.value);
};

const removeSelectedNodes = dash.value?.getSelectedNodes.forEach((nodeElement: any) => {
  const node = amethyst.player.nodeManager.nodes.value
    .find(node => node.properties.id === nodeElement.id);

  node && amethyst.player.nodeManager.removeNode(node);
});

onKeyStroke("Delete", () => {
  removeSelectedNodes();
});

</script>

<template>
  <div
    ref="nodeEditor"
    class="flex-1 h-full w-full  flex flex-col"
  >
    <base-toolbar>
      <base-toolbar-button
        icon="ic:twotone-plus"
        tooltip-text="Add Node"
        @click="useContextMenu().open({x: $event.clientX, y: $event.clientY}, nodeMenu({x: $event.clientX, y: $event.clientY}));"
      />

      <base-toolbar-splitter />

      <input
        v-model="amethyst.player.nodeManager.graphName.value"
        type="text"
        class="text-primary-900 px-2 py-1 rounded-4px bg-surface-900 text-xs placeholder-primary-900 placeholder-opacity-35"
        placeholder="untitled"
        @keydown.stop
      >

      <base-toolbar-button
        icon="ic:twotone-fit-screen"
        tooltip-text="Fit to View"
        @click="fitToView"
      />
      <base-toolbar-button
        icon="ic:twotone-grid-on"
        :active="amethyst.state.settings.value.isSnappingToGrid"
        tooltip-text="Snap to Grid"
        @click="amethyst.state.settings.value.isSnappingToGrid = !amethyst.state.settings.value.isSnappingToGrid"
      />

      <base-toolbar-splitter />

      <base-toolbar-button
        icon="ic:twotone-file-open"
        tooltip-text="Open File"
        @click="handleOpenFile"
      />

      <base-toolbar-button
        icon="ic:twotone-save-as"
        tooltip-text="Save As"
        @click="handleSaveFile"
      />
      
      <base-toolbar-splitter />

      <base-toolbar-button
        icon="ic:twotone-restart-alt"
        tooltip-text="Reset All"
        @click="handleReset"
      />
    </base-toolbar>

    <vue-flow
      ref="dash"
      v-model="elements"
      class="p-2"
      :snap-to-grid="amethyst.state.settings.value.isSnappingToGrid"
      :max-zoom="2.00"
      :min-zoom="1.00"
      :connection-line-style="{ stroke: getThemeColorHex('--primary-700') }"
      :fit-view-on-init="true"
      :select-nodes-on-drag="false"
      @node-drag-stop="handleNodeDragStop"
      @connect="handleConnect"
      @edge-context-menu="handleEdgeContextMenu"
      @contextmenu.capture="handleContextMenu"
    >
      <background
        :size="0.5"
        :variant="BackgroundVariant.Dots"
        :pattern-color="getThemeColorHex('--surface-500')"
      />

      <template
        v-for="node of amethyst.player.nodeManager.nodes.value"
        :key="node.properties.id"
        #[node.getSlotName()]
      >
        <component
          :is="node.component"
          :node="node"
        />
      </template>
    </vue-flow>
  </div>
</template>
<style lang="postcss">
.magnet:hover {
  @apply bg-surface-500;
}

.magnet.active {
  @apply bg-cyan-400 text-surface-900;
}

.magnet.active:hover {
  @apply bg-cyan-300 text-surface-900;
}

/* we will explain what these classes do next! */
.v-enter-active {
  transition: opacity 1ms linear;
}
.v-leave-active {
  transition: opacity 300ms linear;
}

.v-enter-from {
  opacity: 100;
}

.v-leave-to {
  opacity: 0;
}

.vue-flow__node {
  .minimenu {
    @apply invisible opacity-0 duration-100;
  }

  &:hover {
    .minimenu {
      @apply visible opacity-100;
    }
  }
  &:hover > div {
    @apply border-accent border-opacity-50;
  }

  &.selected > div {
    @apply border-accent;
  }
  &.selected .minimenu {
    @apply visible opacity-100;
  }
}

.vue-flow__edge {
  path {
    @apply stroke-surface-400 duration-100 transition-colors;
  }

  &:hover path {
    @apply stroke-accent;
  }

  &.selected path {
    @apply stroke-primary !important;
  }
}

.vue-flow__handle {
  @apply border-surface-400 border-opacity-60 h-1/2 rounded-2px hover:border-accent bg-surface-800 hover:bg-surface-600 duration-100transition-colors;
}

</style>