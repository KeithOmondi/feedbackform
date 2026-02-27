import api from "../../api/axios";

// Removed password requirement
interface LoginPayload {
  pj: string;
}

export const loginUser = async (data: LoginPayload) => {
  const response = await api.post("/users/login", data);
  return response.data;
};