import type { ImageSourcePropType } from "react-native";

export interface NPCVisual {
  rolePortrait: ImageSourcePropType;
  roleLabel: string;
}

export const NPC_VISUALS: Record<string, NPCVisual> = {
  penny: { rolePortrait: require("../assets/npcs/roles/penny_role.png"), roleLabel: "Cafe barista" },
  miguel: { rolePortrait: require("../assets/npcs/roles/miguel_role.png"), roleLabel: "Restaurant host" },
  tom: { rolePortrait: require("../assets/npcs/roles/tom_role.png"), roleLabel: "Taxi driver" },
  hassan: { rolePortrait: require("../assets/npcs/roles/hassan_role.png"), roleLabel: "Airport helper" },
  eleanor: { rolePortrait: require("../assets/npcs/roles/eleanor_role.png"), roleLabel: "Hotel concierge" },
  sujin: { rolePortrait: require("../assets/npcs/roles/sujin_role.png"), roleLabel: "Clinic doctor" },
  minho: { rolePortrait: require("../assets/npcs/roles/minho_role.png"), roleLabel: "Phone shop clerk" },
  youngsook: { rolePortrait: require("../assets/npcs/roles/youngsook_role.png"), roleLabel: "Market vendor" },
  isabel: { rolePortrait: require("../assets/npcs/roles/isabel_role.png"), roleLabel: "Clothing associate" },
  carlos: { rolePortrait: require("../assets/npcs/roles/carlos_role.png"), roleLabel: "Bar host" },
  amira: { rolePortrait: require("../assets/npcs/roles/amira_role.png"), roleLabel: "Bank officer" },
  ryan: { rolePortrait: require("../assets/npcs/roles/ryan_role.png"), roleLabel: "Fast-food cashier" },
  nari: { rolePortrait: require("../assets/npcs/roles/nari_role.png"), roleLabel: "Transit guide" },
  derek: { rolePortrait: require("../assets/npcs/roles/derek_role.png"), roleLabel: "Guesthouse repair manager" },
  mei: { rolePortrait: require("../assets/npcs/roles/mei_role.png"), roleLabel: "Pharmacist" },
  juno: { rolePortrait: require("../assets/npcs/roles/juno_role.png"), roleLabel: "Delivery dispatcher" },
  gloria: { rolePortrait: require("../assets/npcs/roles/gloria_role.png"), roleLabel: "Returns clerk" },
  stan: { rolePortrait: require("../assets/npcs/roles/stan_role.png"), roleLabel: "Post office clerk" },
  hana: { rolePortrait: require("../assets/npcs/roles/hana_role.png"), roleLabel: "Social meetup friend" },
  vincent: { rolePortrait: require("../assets/npcs/roles/vincent_role.png"), roleLabel: "Real-estate agent" },
  claire: { rolePortrait: require("../assets/npcs/roles/claire_role.png"), roleLabel: "Job interviewer" },
  officer_kwon: { rolePortrait: require("../assets/npcs/roles/officer_kwon_role.png"), roleLabel: "Visa officer" },
  luca: { rolePortrait: require("../assets/npcs/roles/luca_role.png"), roleLabel: "Hair stylist" },
};

export function getNPCVisual(npcId: string | null | undefined): NPCVisual | null {
  return npcId ? NPC_VISUALS[npcId] ?? null : null;
}
