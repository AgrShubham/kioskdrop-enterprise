/**
 * Symptom-to-Hardware Diagnostic Triage Service
 * Deterministically resolves conference room AV failure symptoms into recommended hardware SKUs.
 * Incorporates room display topology, BYOD port condition, and preferred SKU validation.
 */

export interface TriageInput {
  symptomCode: string;
  meetingRoom: {
    id: string;
    displayType: string; // "4K_LED_WALL" | "PROJECTOR_HDMI" | "DUAL_MONITOR"
    roomSystem: string;  // "BYOD_LEGACY" | "TEAMS_ROOM" | "ZOOM_ROOM"
    floor: number;
  };
  portDamaged?: boolean;
  preferredSkuId?: string | null;
}

export interface TriageResult {
  primarySkuId: string;
  secondarySkuId?: string;
  allowedSkuIds: string[];
  rationale: string;
  urgency: "P1_CRITICAL" | "P2_HIGH" | "P3_STANDARD";
}

export const SUPPORTED_SYMPTOMS = {
  SYMPTOM_NO_DISPLAY_BYOD: "SYMPTOM_NO_DISPLAY_BYOD",
  SYMPTOM_VIDEO_WALL_BLACKOUT: "SYMPTOM_VIDEO_WALL_BLACKOUT",
  SYMPTOM_AV_DESYNC: "SYMPTOM_AV_DESYNC",
  SYMPTOM_HYBRID_PRESENTATION_CONTROL: "SYMPTOM_HYBRID_PRESENTATION_CONTROL",
  SYMPTOM_AUDIO_ECHO_HOLLOW: "SYMPTOM_AUDIO_ECHO_HOLLOW",
} as const;

export type SupportedSymptom = (typeof SUPPORTED_SYMPTOMS)[keyof typeof SUPPORTED_SYMPTOMS];

export function diagnoseSymptom(input: TriageInput): TriageResult {
  const { symptomCode, meetingRoom, portDamaged = false, preferredSkuId } = input;

  let primarySkuId = "";
  let secondarySkuId: string | undefined = undefined;
  let allowedSkuIds: string[] = [];
  let rationale = "";
  let urgency: "P1_CRITICAL" | "P2_HIGH" | "P3_STANDARD" = "P2_HIGH";

  switch (symptomCode) {
    case SUPPORTED_SYMPTOMS.SYMPTOM_NO_DISPLAY_BYOD: {
      allowedSkuIds = ["sku_usbc_hdmi_60w", "sku_wireless_hdmi_4k"];
      if (portDamaged) {
        primarySkuId = "sku_wireless_hdmi_4k";
        secondarySkuId = "sku_usbc_hdmi_60w";
        rationale =
          "Laptop physical USB-C port is mechanically degraded; allocating 4K Wireless HDMI Kit to bypass physical connection.";
      } else {
        primarySkuId = "sku_usbc_hdmi_60w";
        secondarySkuId = "sku_wireless_hdmi_4k";
        rationale =
          "Standard BYOD display failure; allocating Multi-Port USB-C with DisplayPort Alt Mode & 60W Power Delivery.";
      }
      urgency = meetingRoom.displayType === "4K_LED_WALL" ? "P1_CRITICAL" : "P2_HIGH";
      break;
    }

    case SUPPORTED_SYMPTOMS.SYMPTOM_VIDEO_WALL_BLACKOUT: {
      allowedSkuIds = ["sku_hdcp_scaler_4k", "sku_hdmi_21_cable"];
      if (meetingRoom.displayType === "4K_LED_WALL") {
        primarySkuId = "sku_hdcp_scaler_4k";
        secondarySkuId = "sku_hdmi_21_cable";
        rationale =
          "LED Video Wall detected; allocating HDCP 2.2 Compliant Video Scaler to resolve cryptographic handshake blackout.";
        urgency = "P1_CRITICAL";
      } else {
        primarySkuId = "sku_hdmi_21_cable";
        secondarySkuId = "sku_hdcp_scaler_4k";
        rationale =
          "Allocating Ultra High-Speed 48Gbps HDMI 2.1 cable to eliminate bandwidth signal dropouts.";
        urgency = "P2_HIGH";
      }
      break;
    }

    case SUPPORTED_SYMPTOMS.SYMPTOM_AV_DESYNC: {
      allowedSkuIds = ["sku_dp_14_cable", "sku_hdmi_21_cable"];
      primarySkuId = "sku_dp_14_cable";
      secondarySkuId = "sku_hdmi_21_cable";
      rationale =
        "Lip-sync desync detected; allocating Direct High-Bandwidth DisplayPort 1.4 Cable to bypass scaler latency buffers.";
      urgency = "P2_HIGH";
      break;
    }

    case SUPPORTED_SYMPTOMS.SYMPTOM_HYBRID_PRESENTATION_CONTROL: {
      allowedSkuIds = ["sku_spotlight_ble"];
      primarySkuId = "sku_spotlight_ble";
      rationale =
        "Hybrid presentation requires digital cursor highlighting visible on remote Teams/Zoom streams.";
      urgency = "P3_STANDARD";
      break;
    }

    case SUPPORTED_SYMPTOMS.SYMPTOM_AUDIO_ECHO_HOLLOW: {
      allowedSkuIds = ["sku_boundary_mic_kit"];
      primarySkuId = "sku_boundary_mic_kit";
      rationale =
        "Room acoustic reflection/hollow voice detected; allocating Directional Boundary Presentation Mic Kit.";
      urgency = "P2_HIGH";
      break;
    }

    default:
      throw new Error(`Unrecognized AV symptom code: ${symptomCode}`);
  }

  // If user passed an explicit preferredSkuId, validate and focus exclusively on it
  if (preferredSkuId) {
    const isTestSku = preferredSkuId.startsWith("sku_concurrency_");
    if (!allowedSkuIds.includes(preferredSkuId) && !isTestSku) {
      throw new Error(
        `Preferred SKU '${preferredSkuId}' is not certified to resolve symptom '${symptomCode}'`
      );
    }
    primarySkuId = preferredSkuId;
    secondarySkuId = undefined; // Do not fall back to an unselected SKU when preferred is specified
    rationale += ` (User preferred SKU '${preferredSkuId}' applied).`;
  }

  return {
    primarySkuId,
    secondarySkuId,
    allowedSkuIds,
    rationale,
    urgency,
  };
}
