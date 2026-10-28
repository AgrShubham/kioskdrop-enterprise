import { describe, it, expect } from "vitest";
import { diagnoseSymptom, SUPPORTED_SYMPTOMS } from "../src/services/triage";

describe("Diagnostic Triage Service", () => {
  const standardRoom = {
    id: "room_boardroom_4b",
    displayType: "4K_LED_WALL",
    roomSystem: "BYOD_LEGACY",
    floor: 4,
  };

  it("recommends Multi-Port USB-C for SYMPTOM_NO_DISPLAY_BYOD when port is healthy", () => {
    const result = diagnoseSymptom({
      symptomCode: SUPPORTED_SYMPTOMS.SYMPTOM_NO_DISPLAY_BYOD,
      meetingRoom: standardRoom,
      portDamaged: false,
    });

    expect(result.primarySkuId).toBe("sku_usbc_hdmi_60w");
    expect(result.secondarySkuId).toBe("sku_wireless_hdmi_4k");
    expect(result.allowedSkuIds).toContain("sku_usbc_hdmi_60w");
  });

  it("recommends 4K Wireless HDMI Kit when portDamaged is true", () => {
    const result = diagnoseSymptom({
      symptomCode: SUPPORTED_SYMPTOMS.SYMPTOM_NO_DISPLAY_BYOD,
      meetingRoom: standardRoom,
      portDamaged: true,
    });

    expect(result.primarySkuId).toBe("sku_wireless_hdmi_4k");
    expect(result.secondarySkuId).toBe("sku_usbc_hdmi_60w");
  });

  it("recommends HDCP 2.2 Scaler for 4K_LED_WALL blackout", () => {
    const result = diagnoseSymptom({
      symptomCode: SUPPORTED_SYMPTOMS.SYMPTOM_VIDEO_WALL_BLACKOUT,
      meetingRoom: standardRoom,
    });

    expect(result.primarySkuId).toBe("sku_hdcp_scaler_4k");
    expect(result.urgency).toBe("P1_CRITICAL");
  });

  it("recommends DisplayPort Cable for AV desync to bypass scaler latency", () => {
    const result = diagnoseSymptom({
      symptomCode: SUPPORTED_SYMPTOMS.SYMPTOM_AV_DESYNC,
      meetingRoom: standardRoom,
    });

    expect(result.primarySkuId).toBe("sku_dp_14_cable");
    expect(result.secondarySkuId).toBe("sku_hdmi_21_cable");
  });

  it("recommends Spotlight BLE Presenter for hybrid presentations", () => {
    const result = diagnoseSymptom({
      symptomCode: SUPPORTED_SYMPTOMS.SYMPTOM_HYBRID_PRESENTATION_CONTROL,
      meetingRoom: standardRoom,
    });

    expect(result.primarySkuId).toBe("sku_spotlight_ble");
  });

  it("recommends Boundary Mic Kit for hollow audio", () => {
    const result = diagnoseSymptom({
      symptomCode: SUPPORTED_SYMPTOMS.SYMPTOM_AUDIO_ECHO_HOLLOW,
      meetingRoom: standardRoom,
    });

    expect(result.primarySkuId).toBe("sku_boundary_mic_kit");
  });

  it("validates and applies user preferredSkuId when in allowed set without unrequested fallback", () => {
    const result = diagnoseSymptom({
      symptomCode: SUPPORTED_SYMPTOMS.SYMPTOM_NO_DISPLAY_BYOD,
      meetingRoom: standardRoom,
      portDamaged: false,
      preferredSkuId: "sku_wireless_hdmi_4k", // user specifically prefers wireless
    });

    expect(result.primarySkuId).toBe("sku_wireless_hdmi_4k");
    expect(result.secondarySkuId).toBeUndefined();
  });

  it("throws error when preferredSkuId is not certified for the symptom", () => {
    expect(() =>
      diagnoseSymptom({
        symptomCode: SUPPORTED_SYMPTOMS.SYMPTOM_AUDIO_ECHO_HOLLOW,
        meetingRoom: standardRoom,
        preferredSkuId: "sku_hdmi_21_cable", // HDMI cable cannot fix microphone echo
      })
    ).toThrow(/not certified to resolve symptom/);
  });
});
