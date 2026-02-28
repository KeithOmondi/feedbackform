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
  content?: string;
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
}

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

/** USER: Fetch Questions Only */
export const getManuals = async (): Promise<IManual[]> => {
  const res = await api.get("/manual/get");
  return res.data.data;
};

/** ADMIN: Fetch Questions + Answers */
export const getAdminManuals = async (): Promise<IManual[]> => {
  const res = await api.get("/manual/admin");
  return res.data.data;
};

/** Submit Answer (User/Admin) */
export const addManualEntry = async (payload: PostEntryPayload): Promise<IManual> => {
  const response = await api.post("/manual/entry", payload);
  return response.data.data;
};

/**
 * ADMIN: Download PDF Report
 * @param userId optional, if provided generates individual report
 */
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
};
