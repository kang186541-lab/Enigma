import type { ImageSourcePropType } from "react-native";

export interface NPCVisual {
  rolePortrait: ImageSourcePropType;
  roleLabel: string;
  sceneImage?: ImageSourcePropType;
  sceneColors: readonly [string, string, string];
}

export const NPC_VISUALS: Record<string, NPCVisual> = {
  penny: { rolePortrait: require("../assets/npcs/roles/penny_role.png"), sceneImage: require("../assets/npcs/scenes/penny_cafe_scene.png"), roleLabel: "Cafe barista", sceneColors: ["#1d120d", "#5f321e", "#c48a52"] },
  miguel: { rolePortrait: require("../assets/npcs/roles/miguel_role.png"), sceneImage: require("../assets/npcs/scenes/miguel_restaurant_scene.png"), roleLabel: "Restaurant host", sceneColors: ["#21120b", "#7a3f1d", "#d39a49"] },
  tom: { rolePortrait: require("../assets/npcs/roles/tom_role.png"), sceneImage: require("../assets/npcs/scenes/tom_taxi_scene.png"), roleLabel: "Taxi driver", sceneColors: ["#111821", "#34485c", "#d5a335"] },
  hassan: { rolePortrait: require("../assets/npcs/roles/hassan_role.png"), sceneImage: require("../assets/npcs/scenes/hassan_airport_scene.png"), roleLabel: "Airport helper", sceneColors: ["#102032", "#24516b", "#d7b36a"] },
  eleanor: { rolePortrait: require("../assets/npcs/roles/eleanor_role.png"), roleLabel: "Hotel concierge", sceneColors: ["#19101a", "#58446a", "#c7a16a"] },
  sujin: { rolePortrait: require("../assets/npcs/roles/sujin_role.png"), sceneImage: require("../assets/npcs/scenes/sujin_clinic_scene.png"), roleLabel: "Clinic doctor", sceneColors: ["#102024", "#39666b", "#dce8dd"] },
  minho: { rolePortrait: require("../assets/npcs/roles/minho_role.png"), roleLabel: "Phone shop clerk", sceneColors: ["#121630", "#4052a0", "#6bd6ff"] },
  youngsook: { rolePortrait: require("../assets/npcs/roles/youngsook_role.png"), roleLabel: "Market vendor", sceneColors: ["#181407", "#7c5d20", "#e4b34c"] },
  isabel: { rolePortrait: require("../assets/npcs/roles/isabel_role.png"), roleLabel: "Clothing associate", sceneColors: ["#22101d", "#8b3d61", "#dfa35f"] },
  carlos: { rolePortrait: require("../assets/npcs/roles/carlos_role.png"), roleLabel: "Bar host", sceneColors: ["#17100d", "#633326", "#c48745"] },
  amira: { rolePortrait: require("../assets/npcs/roles/amira_role.png"), roleLabel: "Bank officer", sceneColors: ["#10191a", "#315957", "#d6bd73"] },
  ryan: { rolePortrait: require("../assets/npcs/roles/ryan_role.png"), roleLabel: "Fast-food cashier", sceneColors: ["#24100e", "#9b2f26", "#f0b34e"] },
  nari: { rolePortrait: require("../assets/npcs/roles/nari_role.png"), roleLabel: "Transit guide", sceneColors: ["#101522", "#354f8c", "#d9d2a6"] },
  derek: { rolePortrait: require("../assets/npcs/roles/derek_role.png"), roleLabel: "Guesthouse repair manager", sceneColors: ["#191511", "#5c4d3d", "#b99268"] },
  mei: { rolePortrait: require("../assets/npcs/roles/mei_role.png"), roleLabel: "Pharmacist", sceneColors: ["#0f1f1c", "#2f7c70", "#d8e7d5"] },
  juno: { rolePortrait: require("../assets/npcs/roles/juno_role.png"), roleLabel: "Delivery dispatcher", sceneColors: ["#171018", "#713c74", "#e0a85d"] },
  gloria: { rolePortrait: require("../assets/npcs/roles/gloria_role.png"), roleLabel: "Returns clerk", sceneColors: ["#17141b", "#4f5668", "#d2aa66"] },
  stan: { rolePortrait: require("../assets/npcs/roles/stan_role.png"), roleLabel: "Post office clerk", sceneColors: ["#151415", "#5b3f3e", "#caa56d"] },
  hana: { rolePortrait: require("../assets/npcs/roles/hana_role.png"), roleLabel: "Social meetup friend", sceneColors: ["#16131d", "#604c8b", "#f0b774"] },
  vincent: { rolePortrait: require("../assets/npcs/roles/vincent_role.png"), roleLabel: "Real-estate agent", sceneColors: ["#12171d", "#445d72", "#d7b36a"] },
  claire: { rolePortrait: require("../assets/npcs/roles/claire_role.png"), roleLabel: "Job interviewer", sceneColors: ["#13161b", "#39485c", "#c6a86a"] },
  officer_kwon: { rolePortrait: require("../assets/npcs/roles/officer_kwon_role.png"), roleLabel: "Visa officer", sceneColors: ["#10171c", "#2f5963", "#d4b06c"] },
  luca: { rolePortrait: require("../assets/npcs/roles/luca_role.png"), roleLabel: "Hair stylist", sceneColors: ["#1b111a", "#7a3d69", "#efb66a"] },
};

export function getNPCVisual(npcId: string | null | undefined): NPCVisual | null {
  return npcId ? NPC_VISUALS[npcId] ?? null : null;
}
