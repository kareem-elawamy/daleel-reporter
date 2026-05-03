import { axiosClient } from "@/lib/api/axiosClient";
import type { LoginRequest, RegisterRequest, TokenResponse } from "@/types/api";

export class AuthService {
  static async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await axiosClient.post<TokenResponse>("/auth/login", data);
    return response.data;
  }

  static async register(data: RegisterRequest): Promise<TokenResponse> {
    const response = await axiosClient.post<TokenResponse>("/auth/register", data);
    return response.data;
  }

  static async logout(): Promise<void> {
    await axiosClient.post("/auth/logout");
    
    // Clear local storage after successful logout
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }
}
