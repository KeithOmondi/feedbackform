import api from "../../api/axios";

interface LoginPayload {
  pj: string;
  password: string;
}

export const loginUser = async (data: LoginPayload) => {
  const response = await api.post("/users/login", data);
  return response.data;
};
