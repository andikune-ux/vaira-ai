import { Redirect } from "expo-router";

/** Rute lama dipertahankan agar tautan yang sudah ada selalu membuka formulir Rencana yang sama. */
export default function SmartFinanceRedirect() {
  return <Redirect href="/plan-form" />;
}
