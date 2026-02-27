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
  reference?: string; // Added for Field 3
}

export interface IManual {
  _id: string;
  code: string;
  title: string;
  part: string;
  description?: string; // Added for UI Subtitles
  content?: string;     // The Draft Provision text
  comments: IManualEntry[];
  amendments: IManualEntry[];
  justifications: IManualEntry[];
  references: IManualEntry[]; // Added for Field 3
}

// Added "reference" to match the updated backend controller
export type EntryType = "comment" | "amendment" | "justification" | "reference";

export interface PostEntryPayload {
  sectionId: string;
  userId: string;
  content: string; 
  type: EntryType;
}

/* ===============================
    SERVICE FUNCTIONS
================================ */

export const getManuals = async (): Promise<IManual[]> => {
  const res = await api.get("/manual/get"); 
  return res.data.data;
};

export const addManualEntry = async (payload: PostEntryPayload): Promise<IManual> => {
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