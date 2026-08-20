export type SmartHealthDietPattern = "seimbang" | "rendah_gula" | "tinggi_protein" | "vegetarian" | "halal" | "lainnya";
export type SmartHealthPerson = { id: string; name: string; ageYears?: number; heightCm?: number; weightKg?: number; dietPattern?: SmartHealthDietPattern; allergies?: string };

export type SmartHealthFood = { id: string; group: "sayur" | "lauk" | "bumbu" | "pokok" | "buah" | "lainnya"; name: string; brand?: string; quantity: number; unit: string; price: number; purchaseDate?: string; frequency: "daily" | "weekly" | "monthly" };
export type SmartHealthProfile = { people: SmartHealthPerson[]; foods: SmartHealthFood[]; updatedAt: string };
export const SMART_HEALTH_STORAGE_KEY = "vaira.smart-finance-health.local.v1";
export const healthFoodGroupLabel = (group: SmartHealthFood["group"]) => ({ sayur: "Sayur", lauk: "Lauk/protein", bumbu: "Bumbu pokok", pokok: "Bahan pokok", buah: "Buah", lainnya: "Lainnya" })[group];
export const monthlyFoodCost = (food: Pick<SmartHealthFood, "quantity" | "price" | "frequency">) => food.quantity * food.price * (food.frequency === "daily" ? 30 : food.frequency === "weekly" ? 52 / 12 : 1);

const round = (value: number) => Math.max(0, Math.round(value));
const nutritionForPerson = (person: SmartHealthPerson) => {
  const weight = Number(person.weightKg);
  const age = Number(person.ageYears);
  if (!Number.isFinite(weight) || weight <= 0) return null;
  const child = Number.isFinite(age) && age < 10;
  const calories = child ? weight * 85 : weight * 28;
  const protein = weight * (child ? 1.2 : 0.9);
  const carbohydrates = calories * 0.55 / 4;
  const meals = child ? 3 : 3;
  const carbohydratePortion = child ? "½–1 centong nasi matang" : "1–1½ centong nasi matang";
  const proteinPortion = child ? "1 potong kecil atau 1 telur kecil" : "1 telapak tangan lauk/protein";
  const vegetablePortion = child ? "½ genggam sayur lembut" : "2 genggam sayur";
  const fruitPortion = child ? "½ porsi buah" : "1 porsi buah";
  return { calories, protein, carbohydrates, meals, carbohydratePortion, proteinPortion, vegetablePortion, fruitPortion };
};

export const getSmartHealthNutritionAdvice = (profile?: SmartHealthProfile) => {
  const people = profile?.people ?? [];
  if (!people.length) return "Tambahkan nama, umur, tinggi, dan berat anggota keluarga bila ingin Analisis Aira menghitung porsi makan secara spesifik.";
  const advice = people.map((person) => {
    const name = person.name || "Anggota keluarga";
    const nutrition = nutritionForPerson(person);
    if (!nutrition) return `${name}: berat belum diisi, jadi porsi makan spesifik belum dapat dihitung.`;
    const height = Number(person.heightCm);
    const heightText = Number.isFinite(height) && height > 0 ? `tinggi ${round(height)} cm` : "tinggi belum diisi";
    const dietText = person.dietPattern === "rendah_gula" ? "batasi minuman dan camilan manis" : person.dietPattern === "tinggi_protein" ? "prioritaskan protein rendah lemak" : person.dietPattern === "vegetarian" ? "pilih protein nabati seperti tempe, tahu, kacang, atau telur sesuai pilihan" : person.dietPattern === "halal" ? "pilih bahan dan sumber protein yang halal" : "gunakan komposisi makan seimbang";
    const allergyText = person.allergies?.trim() ? ` Hindari atau periksa label bahan yang dicatat sebagai alergi/pantangan: ${person.allergies.trim()}.` : "";
    return `${name} (${person.ageYears ?? "umur belum diisi" } tahun, ${heightText}, berat ${round(Number(person.weightKg))} kg, pola ${person.dietPattern ?? "seimbang"}): target energi perkiraan ${round(nutrition.calories)} kkal/hari, protein sekitar ${nutrition.protein.toFixed(1)} g/hari, dan karbohidrat sekitar ${round(nutrition.carbohydrates)} g/hari. Dari ${nutrition.meals} kali makan utama, setiap porsi dapat berisi ${nutrition.carbohydratePortion}, ${nutrition.proteinPortion}, ${nutrition.vegetablePortion}, serta ${nutrition.fruitPortion}; ${dietText}.${allergyText}`;
  });
  return `Analisis makan spesifik keluarga (estimasi offline): ${advice.join(" ")}`;
};

export const getHealthyFoodAdvice = (profile?: SmartHealthProfile) => {
  if (!profile?.people.length && !profile?.foods.length) return "Profil sehat dan rincian pangan bersifat opsional. Isi jika ingin rekomendasi lebih personal.";
  const foodCost = (profile.foods ?? []).reduce((total, food) => total + monthlyFoodCost(food), 0);
  const groups = new Set((profile.foods ?? []).map((food) => food.group));
  return [foodCost > 0 ? `Perkiraan anggaran pangan dari rincian Anda sekitar Rp${Math.round(foodCost).toLocaleString("id-ID")} per bulan.` : "Tambahkan harga bahan untuk menghitung anggaran pangan.", groups.has("sayur") ? "Pertahankan variasi sayur dan warna bahan." : "Pertimbangkan menambahkan sayur beragam warna.", groups.has("lauk") ? "Atur lauk/protein sesuai kebiasaan dan kondisi keluarga." : "Pertimbangkan sumber protein yang sesuai anggaran.", groups.has("bumbu") ? "Bumbu pokok dicatat terpisah agar belanja kecil tidak terlewat." : "Bumbu pokok seperti bawang, cabai, garam, gula, dan minyak dapat dicatat bila diperlukan.", getSmartHealthNutritionAdvice(profile)].join(" ");
};
