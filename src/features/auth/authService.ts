import api from "../../api/axios";

// Strictly PJ-based login payload
interface LoginPayload {
  pj: string;
}

export const loginUser = async (data: LoginPayload) => {
  // Assuming your backend route is POST /api/users/login
  const response = await api.post("/users/login", data);
  return response.data; // This returns { token, data: { ...user } }
};