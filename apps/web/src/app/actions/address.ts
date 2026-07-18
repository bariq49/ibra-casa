import api from "@/lib/api";

export async function saveAddressAction(
  userId: string,
  addressId: string | null,
  payload: any,
) {
  try {
    let res;
    if (addressId) {
      res = await api.put(
        `/api/users/${userId}/addresses/${addressId}`,
        payload,
      );
    } else {
      res = await api.post(
        `/api/users/${userId}/addresses`,
        payload,
      );
    }

    if (res.data?.success) {
      return {
        success: true,
        message: "Address saved securely via Server Action",
        addresses: res.data.addresses,
      };
    }

    return { success: false, message: "Failed to save address" };
  } catch (error: any) {
    console.error(
      "Save address server action error:",
      error.data || error.message,
    );
    return {
      success: false,
      message: error.data?.message || "Internal server action error",
    };
  }
}

export async function deleteAddressAction(
  userId: string,
  addressId: string,
) {
  try {
    const res = await api.delete(`/api/users/${userId}/addresses/${addressId}`);

    if (res.data?.success) {
      return {
        success: true,
        message: "Address deleted securely via Server Action",
        addresses: res.data.addresses,
      };
    }

    return { success: false, message: "Failed to delete address" };
  } catch (error: any) {
    console.error(
      "Delete address server action error:",
      error.data || error.message,
    );
    return {
      success: false,
      message: error.data?.message || "Internal server action error",
    };
  }
}

