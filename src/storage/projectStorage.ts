import { Project } from "../types";
import { getData, setData, removeData } from "./asyncStorage";
import { generateId, getStatusFromProgress } from "../utils/helpers";
import { getAllSubtasksForProject, deleteSubtask } from "./subtaskStorage";
import { addHistoryItem } from "./historyStorage";
import { calculateProgress } from "../utils/helpers";

const PROJECTS_KEY = "@qorix_projects";

export const getAllProjects = async (): Promise<Project[]> => {
  const projects = await getData<Project[]>(PROJECTS_KEY);
  return projects || [];
};

export const getProjectById = async (id: string): Promise<Project | null> => {
  const projects = await getAllProjects();
  return projects.find((p) => p.id === id) || null;
};

export const saveProject = async (
  project: Omit<
    Project,
    "id" | "progress" | "status" | "createdAt" | "updatedAt"
  >,
): Promise<Project> => {
  const projects = await getAllProjects();
  const now = new Date().toISOString();
  const newProject: Project = {
    ...project,
    id: generateId(),
    progress: 0,
    status: "NEW",
    createdAt: now,
    updatedAt: now,
  };
  projects.push(newProject);
  await setData(PROJECTS_KEY, projects);
  await addHistoryItem("project", newProject.id, "created", null, newProject);
  return newProject;
};

export const updateProject = async (
  id: string,
  updates: Partial<Project>,
): Promise<Project | null> => {
  const projects = await getAllProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const oldProject = { ...projects[index] };
  const updatedProject = {
    ...oldProject,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  const subtasks = await getAllSubtasksForProject(id);
  const progress = calculateProgress(subtasks);
  updatedProject.progress = progress;
  updatedProject.status = getStatusFromProgress(progress);
  projects[index] = updatedProject;
  await setData(PROJECTS_KEY, projects);
  await addHistoryItem("project", id, "updated", oldProject, updatedProject);
  return updatedProject;
};

export const deleteProject = async (id: string): Promise<void> => {
  const projects = await getAllProjects();
  const projectToDelete = projects.find((p) => p.id === id);
  if (!projectToDelete) return;
  const filtered = projects.filter((p) => p.id !== id);
  await setData(PROJECTS_KEY, filtered);
  const subtasks = await getAllSubtasksForProject(id);
  for (const st of subtasks) {
    await deleteSubtask(st.id);
  }
  await addHistoryItem("project", id, "deleted", projectToDelete, null);
};

export const recalcProjectProgress = async (
  projectId: string,
): Promise<void> => {
  const project = await getProjectById(projectId);
  if (!project) return;
  const subtasks = await getAllSubtasksForProject(projectId);
  const progress = calculateProgress(subtasks);
  const status = getStatusFromProgress(progress);
  const projects = await getAllProjects();
  const index = projects.findIndex((p) => p.id === projectId);
  if (index !== -1) {
    projects[index].progress = progress;
    projects[index].status = status;
    projects[index].updatedAt = new Date().toISOString();
    await setData(PROJECTS_KEY, projects);
  }
};
