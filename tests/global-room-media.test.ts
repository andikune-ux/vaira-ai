import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("stabilitas media Room Global", () => {
  it("menggunakan satu modal pratinjau di tingkat layar chat", () => {
    const chat = source("app/global-room-chat.tsx");
    const media = source("components/retryable-media-image.tsx");
    expect(chat.match(/<Modal visible=\{selectedRoomPhotoUri !== null\}/g)).toHaveLength(1);
    expect(chat).toContain("onPreview={setSelectedRoomPhotoUri}");
    expect(media).not.toContain("<Modal");
    expect(media).not.toContain("previewOpen");
  });

  it("memakai cache gambar dan membatasi batch render daftar pesan", () => {
    const chat = source("app/global-room-chat.tsx");
    expect(chat).not.toContain('cachePolicy="none"');
    expect(chat).toContain('cachePolicy="memory-disk"');
    expect(chat).toContain("windowSize={7}");
    expect(chat).toContain("maxToRenderPerBatch={6}");
    expect(chat).toContain("updateCellsBatchingPeriod={50}");
  });
});
