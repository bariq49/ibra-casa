import api from "@/lib/api";

export async function fetchCountriesAction() {
  try {
    const res = await api.get("/api/locations/countries", {
      next: { revalidate: 600 }
    });
    return { success: true, data: res.data.data };
  } catch (error: any) {
    console.error("Failed fetching countries:", error.message);
    return { success: false, data: [] };
  }
}

export async function fetchStatesAction(countryCode: string) {
  if (!countryCode) return { success: false, data: [] };
  try {
    const res = await api.get(`/api/locations/states/${countryCode}`, {
      next: { revalidate: 600 }
    });
    return { success: true, data: res.data.data };
  } catch (error: any) {
    console.error("Failed fetching states:", error.message);
    return { success: false, data: [] };
  }
}

export async function fetchCitiesAction(
  countryCode: string,
  stateCode: string,
) {
  if (!countryCode || !stateCode) return { success: false, data: [] };
  try {
    const res = await api.get(`/api/locations/cities/${countryCode}/${stateCode}`, {
      next: { revalidate: 600 }
    });
    return { success: true, data: res.data.data };
  } catch (error: any) {
    console.error("Failed fetching cities:", error.message);
    return { success: false, data: [] };
  }
}
