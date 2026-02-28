import api from "../../api/axios";

/* ===============================
    TYPES & INTERFACES
================================ */

export interface IManualEntry {
  userId: any;
  createdAt: string;
  comment?: string;
  proposedChange?: string;
  justification?: string;
  reference?: string;
  action?: "amend" | "clarify" | "Retain as is" | "delete"; // Added action enum
}

export interface IManual {
  _id: string;
  code: string;
  title: string;
  part: string;
  description?: string;
  content?: string;
  comments: IManualEntry[];
  amendments: IManualEntry[];
  justifications: IManualEntry[];
  references: IManualEntry[];
  actions: IManualEntry[]; // Added actions array
}

// Updated EntryType to include "action"
export type EntryType = "comment" | "amendment" | "justification" | "reference" | "action";

export interface PostEntryPayload {
  sectionId: string;
  userId: string;
  content: string; // This will hold the action string (e.g., "amend") if type is "action"
  type: EntryType;
}

/* ===============================
    SERVICE FUNCTIONS
================================ */

export const getManuals = async (): Promise<IManual[]> => {
  const res = await api.get("/manual/get");
  return res.data.data;
};

export const getAdminManuals = async (): Promise<IManual[]> => {
  const res = await api.get("/manual/admin");
  return res.data.data;
};

export const addManualEntry = async (payload: PostEntryPayload): Promise<IManual> => {
  const response = await api.post("/manual/entry", payload);
  return response.data.data;
};

export const downloadManualReport = async (userId?: string): Promise<void> => {
  const response = await api.get("/manual/admin/download", {
    responseType: "blob",
    params: userId ? { userId } : {},
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `${userId ? `User_${userId}_Manual_Report` : "Admin_Manual_Report"}_${
      new Date().toISOString().split("T")[0]
    }.pdf`
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url); // Clean up memory
};


// Add this to your service file
export const removeManualEntry = async (
  sectionId: string, 
  entryType: string, 
  entryId: string
): Promise<IManual> => {
  // Matches backend route: DELETE /manual/entry/:sectionId/:entryType/:entryId
  const response = await api.delete(`/manual/section/${sectionId}/${entryType}/${entryId}`);
  return response.data.data;
};