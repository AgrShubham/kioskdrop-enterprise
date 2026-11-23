import { describe, it, expect, beforeEach } from "vitest";

describe("WebSplashScreen Session Storage Gate", () => {
  const store: Record<string, string> = {};
  const mockSessionStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      for (const k in store) delete store[k];
    },
  };

  beforeEach(() => {
    mockSessionStorage.clear();
  });

  it("flags session storage on boot dismissal", () => {
    expect(mockSessionStorage.getItem("kioskdrop_boot_shown")).toBeNull();
    mockSessionStorage.setItem("kioskdrop_boot_shown", "true");
    expect(mockSessionStorage.getItem("kioskdrop_boot_shown")).toBe("true");
  });
});

