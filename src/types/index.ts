export interface Project {
  id: string;
  clientName: string;
  projectName: string;
  description: string;
  deadline: string;
  progress: number;
  status: "NEW" | "IN_PROGRESS" | "COMPLETED";
  projectType: "WEBSITE" | "SEO" | "ADS" | "SUPPORT" | "ANALYTICS";
  createdAt: string;
  updatedAt: string;
}

export interface SubTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  difficulty: "LOW" | "MEDIUM" | "HIGH";
  weight: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryItem {
  id: string;
  entityType: "project" | "subtask";
  entityId: string;
  action: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
}

export type ProjectStatus = "NEW" | "IN_PROGRESS" | "COMPLETED";
export type Difficulty = "LOW" | "MEDIUM" | "HIGH";
export type ProjectType = "WEBSITE" | "SEO" | "ADS" | "SUPPORT" | "ANALYTICS";
