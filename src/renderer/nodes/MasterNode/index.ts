import { AmethystAudioNode } from "@/logic/audio";
import type { NodeProperties } from "@/logic/audioManager";
import component from "./component.vue";

export class AmethystMasterNode extends AmethystAudioNode {
  public constructor(context: AudioContext, position: NodeProperties["position"]) {
    const pre = context.createGain();
    const post = context.createGain();
    pre.connect(post);
    super(pre, post, "AmethystMasterNode", component, position, false, false, false);
  }

  public override getParameters() {
    return {};
  }
}
