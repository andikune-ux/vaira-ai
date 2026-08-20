# Draf Generator Gambar V A I R A A I

Status: **draf untuk ditinjau — belum dipublikasikan dan belum terhubung ke akun Perchance**.

## Konsep

Generator ini memakai plugin resmi `text-to-image-plugin` Perchance di dalam halaman generator Perchance. Identitas visualnya memakai nama **V A I R A  A I**, aksen emas lembut, latar biru malam, dan kartu kontrol yang ringkas. Generator tidak mengirim API key dari aplikasi dan tidak mencoba memanggil endpoint internal Perchance.

## Preset gaya

Preset awal yang disediakan adalah:

| Preset | Arah visual |
|---|---|
| Kartu Idul Fitri | Ornamen lentera, pola geometris Islami, warna hijau zamrud dan emas |
| Maulid Nabi | Lentera, bulan sabit, nuansa hijau tua, krem, dan emas |
| HUT Indonesia | Merah putih, bendera, ornamen perayaan, komposisi ceria |
| Foto profil VAIRA | Potret editorial, pencahayaan lembut, latar bersih |
| Ilustrasi lembut | Digital painting, warna pastel, suasana hangat |
| Poster acara | Tipografi ruang kosong yang cukup, komposisi vertikal |

## Lists Editor Perchance

```text
image = {import:text-to-image-plugin}

presetName
  Kartu Idul Fitri
  Maulid Nabi
  HUT Indonesia
  Foto profil VAIRA
  Ilustrasi lembut
  Poster acara

presetPrompt
  ornamen lentera Islami, pola geometris elegan, hijau zamrud, emas, suasana Idul Fitri, komposisi kartu ucapan mewah
  lentera, bulan sabit, ornamen Islami yang meriah namun tidak kaku, hijau tua, krem, emas, suasana Maulid Nabi
  bendera merah putih, ornamen kemerdekaan Indonesia, suasana hangat dan meriah, komposisi poster perayaan
  editorial portrait, soft studio lighting, clean background, elegant navy and gold visual identity, refined composition
  gentle digital painting, warm pastel palette, soft light, expressive but tasteful composition
  polished event poster, balanced negative space, refined navy and gold accent, clear visual hierarchy

negativePrompt
  low quality, blurry, distorted face, extra fingers, watermark, unreadable text, cropped subject, duplicate subject, explicit sexual content, graphic violence

promptData
  prompt = [userPrompt], [selectedPresetPrompt]
  negativePrompt = [negativePrompt]
  resolution = 512x768
  guidanceScale = 7
  hideGalleryButtons = true
  saveTitle = V A I R A A I - [selectedPresetName]
  saveDescription = Generator gambar khusus V A I R A A I

output [image(promptData)]
```

## HTML panel

```html
<div class="vaira-shell">
  <header class="vaira-header">
    <div class="vaira-mark">VA</div>
    <div>
      <h1>V A I R A  A I</h1>
      <p>Generator gambar kreatif</p>
    </div>
  </header>

  <label for="selectedPresetName">Preset gaya</label>
  <select id="selectedPresetName">
    <option>Kartu Idul Fitri</option>
    <option>Maulid Nabi</option>
    <option>HUT Indonesia</option>
    <option>Foto profil VAIRA</option>
    <option>Ilustrasi lembut</option>
    <option>Poster acara</option>
  </select>

  <label for="userPrompt">Deskripsi gambar</label>
  <textarea id="userPrompt" placeholder="Contoh: kartu ucapan hangat untuk keluarga..."></textarea>

  <button id="generateButton">Buat gambar</button>
  <div id="output" class="vaira-output"></div>
  <p class="vaira-credit">Dibuat melalui generator V A I R A  A I</p>
</div>
```

## JavaScript perilaku

```javascript
async function generateVairaImage() {
  const prompt = document.querySelector('#userPrompt').value.trim();
  if (!prompt) return;

  const selectedPresetName = document.querySelector('#selectedPresetName').value;
  const selectedPresetPrompt = presetPrompt.evaluateItem;
  const result = await image({
    prompt: `${prompt}, ${selectedPresetPrompt}`,
    negativePrompt,
    resolution: '512x768',
    guidanceScale: 7,
    hideGalleryButtons: true,
  });

  document.querySelector('#output').replaceChildren(result.canvas);
}

document.querySelector('#generateButton').onclick = generateVairaImage;
```

## Catatan teknis penting

Kode di atas adalah draf struktur, bukan publikasi final. `text-to-image-plugin` harus tetap dieksekusi di halaman Perchance agar pembiayaan GPU dan mekanisme plugin tetap berjalan sesuai dokumentasi Perchance. Aira nantinya dapat membuka generator ini melalui WebView atau embed setelah URL generator berhasil dibuat dan diuji.

Sebelum publikasi, perlu dilakukan satu putaran review untuk memperbaiki sintaks Lists Editor, menyelaraskan binding input dengan `promptData`, dan menguji hasil pada perangkat portrait. Setelah itu, generator dapat dibuat di akun Perchance tanpa membagikan password melalui chat.
