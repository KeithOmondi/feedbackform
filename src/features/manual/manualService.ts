import api from "../../api/axios";

/* ===============================
    TYPES & INTERFACES
================================ */
export interface IManualEntry {
  userId: string;
  createdAt: string;
  comment?: string;
  proposedChange?: string;
  justification?: string;
}

export interface IManual {
  _id: string;
  code: string;
  title: string;
  part: string;
  comments: IManualEntry[];
  amendments: IManualEntry[];
  justifications: IManualEntry[];
}

// These match the 'type' keys handled by your new backend controller
export type EntryType = "comment" | "amendment" | "justification";

export interface PostEntryPayload {
  sectionId: string;
  userId: string;
  content: string; // Unified name
  type: EntryType;
}

/* ===============================
    SERVICE FUNCTIONS
================================ */

export const getManuals = async (): Promise<IManual[]> => {
  const res = await api.get("/manual/get"); // Matching our updated route
  return res.data.data;
};

export const addManualEntry = async (payload: PostEntryPayload): Promise<IManual> => {
  // Hits the single POST /manual/entry route
  const response = await api.post(`/manual/entry`, payload);
  return response.data.data;
};

export const updateManual = async (id: string, data: Partial<IManual>): Promise<IManual> => {
  const res = await api.put(`/manual/${id}`, data);
  return res.data.data;
};

export const deleteManual = async (id: string): Promise<void> => {
  await api.delete(`/manual/${id}`);
};