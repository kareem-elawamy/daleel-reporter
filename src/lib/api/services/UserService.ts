import { axiosClient } from "@/lib/api/axiosClient";
import type { UserProfileDto, UpdateProfileRequest } from "@/types/api";

export class UserService {
  /**
   * Fetch the current authenticated user's profile
   */
  static async getMe(): Promise<UserProfileDto> {
    const response = await axiosClient.get<UserProfileDto>("/auth/me");
    return response.data;
  }

  /**
   * Update the current authenticated user's profile
   */
  static async updateProfile(data: UpdateProfileRequest): Promise<UserProfileDto> {
    const response = await axiosClient.put<UserProfileDto>("/profiles/me", data);
    return response.data;
  }
}
