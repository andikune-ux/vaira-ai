export type SmartHealthDietPattern = "seimbang" | "rendah_gula" | "tinggi_protein" | "vegetarian" | "halal" | "lainnya";
export type SmartHealthPerson = { id: string; name: string; ageYears?: number; heightCm?: number; weightKg?: number; dietPattern?: SmartHealthDietPattern; allergies?: string };

export type SmartHealthFood = { id: string; group: "sayur" | "lauk" | "bumbu" | "pokok" | "buah" | "lainnya"; name: string; brand?: string; quantity: number; unit: string; price: number; purchaseDate?: string; frequency: "daily" | "weekly" | "monthly" };
export type SmartHealthProfile = { people: SmartHealthPerson[]; foods: SmartHealthFood[]; updatedAt: string };
export const SMART_HEALTH_STORAGE_KEY = "vaira.smart-finance-health.local.v1";
export const healthFoodGroupLabel = (group: SmartHealthFood["group"]) => ({ sayur: "Sayur", lauk: "Lauk/protein", bumbu: "Bumbu pokok", pokok: "Bahan pokok", buah: "Buah", lainnya: "Lainnya" })[group];
export const monthlyFoodCost = (food: Pick<SmartHealthFood, "quantity" | "price" | "frequency">) => food.quantity * food.price * (food.frequency === "daily" ? 30 : food.frequency === "weekly" ? 52 / 12 : 1);

export const getSmartHealthNutritionAdvice = (profile?: SmartHealthProfile) => {
  const people = profile?.people ?? [];
  if (!people.length) return "Tambahkan profil keluarga bila ingin membuat catatan belanja pangan yang lebih teratur. Catatan ini tidak menghitung porsi medis atau diagnosis.";
  const advice = people.map((person) => {
    const name = person.name || "Anggota keluarga";
    const height = Number(person.heightCm);
    const heightText = Number.isFinite(height) && height > 0 ? `tinggi ${Math.round(height)} cm` : "tinggi belum diisi";
    const dietText = person.dietPattern === "rendah_gula" ? "catat pilihan rendah gula sesuai arahan profesional yang sudah diterima" : person.dietPattern === "tinggi_protein" ? "catat sumber protein yang biasa dipilih keluarga" : person.dietPattern === "vegetarian" ? "catat pilihan protein nabati yang biasa digunakan" : person.dietPattern === "halal" ? "catat sumber protein yang sesuai pilihan halal keluarga" : "catat bahan pokok, protein, sayur, dan buah sesuai kebiasaan keluarga";
    const allergyText = person.allergies?.trim() ? ` Periksa label dan pisahkan bahan yang dicatat sebagai alergi/pantangan: ${person.allergies.trim()}.` : "";
    return `${name} (${person.ageYears ?? "umur belum diisi"} tahun, ${heightText}): ${dietText}.${allergyText}`;
  });
  return `Catatan perencanaan pangan keluarga: ${advice.join(" ")} Catatan ini bersifat umum, bukan diagnosis, target kalori, atau pengaturan porsi individual.`;
};

export const getHealthyFoodAdvice = (profile?: SmartHealthProfile) => {
  if (!profile?.people.length && !profile?.foods.length) return "Profil sehat dan rincian pangan bersifat opsional. Isi jika ingin rekomendasi lebih personal.";
  const foodCost = (profile.foods ?? []).reduce((total, food) => total + monthlyFoodCost(food), 0);
  const groups = new Set((profile.foods ?? []).map((food) => food.group));
  return [foodCost > 0 ? `Perkiraan anggaran pangan dari rincian Anda sekitar Rp${Math.round(foodCost).toLocaleString("id-ID")} per bulan.` : "Tambahkan harga bahan untuk menghitung anggaran pangan.", groups.has("sayur") ? "Pertahankan variasi sayur dan warna bahan." : "Pertimbangkan menambahkan sayur beragam warna.", groups.has("lauk") ? "Atur lauk/protein sesuai kebiasaan dan kondisi keluarga." : "Pertimbangkan sumber protein yang sesuai anggaran.", groups.has("bumbu") ? "Bumbu pokok dicatat terpisah agar belanja kecil tidak terlewat." : "Bumbu pokok seperti bawang, cabai, garam, gula, dan minyak dapat dicatat bila diperlukan.", getSmartHealthNutritionAdvice(profile)].join(" ");
};
