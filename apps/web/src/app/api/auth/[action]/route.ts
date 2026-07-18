import { NextRequest, NextResponse } from "next/server";
import api from "@/lib/api";
import { AUTH_ENDPOINTS } from "@/constants/endpoints";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  const { action } = await params;

  if (action !== "login" && action !== "register") {
    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const endpoint =
      action === "login" ? AUTH_ENDPOINTS.LOGIN : AUTH_ENDPOINTS.REGISTER;
    const response = await api.post(endpoint, body);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Auth ${action} error:`, error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || `Failed to ${action}`;

    return NextResponse.json({ message }, { status });
  }
}
