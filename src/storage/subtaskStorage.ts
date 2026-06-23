import { SubTask } from "../types";
import { getData, setData, removeData } from "./asyncStorage";
import { generateId, getWeightForDifficulty } from "../utils/helpers";
import { addHistoryItem } from "./historyStorage";
import { recalcProjectProgress } from "./projectStorage";

const SUBTASKS_KEY = "@qorix_subtasks";

export const getAllSubtasks = async (): Promise<SubTask[]> => {
  const data = await getData<SubTask[]>(SUBTASKS_KEY);
  return data || [];
};

export const getAllSubtasksForProject = async (
  projectId: string,
): Promise<SubTask[]> => {
  const all = await getAllSubtasks();
  return all.filter((st) => st.projectId === projectId);
};

export const getSubtaskById = async (id: string): Promise<SubTask | null> => {
  const all = await getAllSubtasks();
  return all.find((st) => st.id === id) || null;
};

export const saveSubtask = async (
  subtask: Omit<
    SubTask,
    "id" | "weight" | "completed" | "createdAt" | "updatedAt"
  >,
): Promise<SubTask> => {
  const all = await getAllSubtasks();
  const now = new Date().toISOString();
  const newSubtask: SubTask = {
    ...subtask,
    id: generateId(),
    weight: getWeightForDifficulty(subtask.difficulty),
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
  all.push(newSubtask);
  await setData(SUBTASKS_KEY, all);
  await addHistoryItem("subtask", newSubtask.id, "created", null, newSubtask);
  // Пересчёт прогресса проекта
  await recalcProjectProgress(subtask.projectId);
  return newSubtask;
};

export const updateSubtask = async (
  id: string,
  updates: Partial<SubTask>,
): Promise<SubTask | null> => {
  const all = await getAllSubtasks();
  const index = all.findIndex((st) => st.id === id);
  if (index === -1) return null;
  const oldSubtask = { ...all[index] };
  const updatedSubtask = {
    ...oldSubtask,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  // Если изменилась сложность, пересчитываем вес
  if (updates.difficulty) {
    updatedSubtask.weight = getWeightForDifficulty(updatedSubtask.difficulty);
  }
  all[index] = updatedSubtask;
  await setData(SUBTASKS_KEY, all);
  await addHistoryItem("subtask", id, "updated", oldSubtask, updatedSubtask);
  // Пересчёт прогресса проекта
  await recalcProjectProgress(updatedSubtask.projectId);
  return updatedSubtask;
};

export const deleteSubtask = async (id: string): Promise<void> => {
  const all = await getAllSubtasks();
  const subtask = all.find((st) => st.id === id);
  if (!subtask) return;
  const filtered = all.filter((st) => st.id !== id);
  await setData(SUBTASKS_KEY, filtered);
  await addHistoryItem("subtask", id, "deleted", subtask, null);
  await recalcProjectProgress(subtask.projectId);
};

export const toggleSubtaskCompletion = async (
  id: string,
): Promise<SubTask | null> => {
  const all = await getAllSubtasks();
  const index = all.findIndex((st) => st.id === id);
  if (index === -1) return null;
  const oldSubtask = { ...all[index] };
  const updatedSubtask = {
    ...oldSubtask,
    completed: !oldSubtask.completed,
    updatedAt: new Date().toISOString(),
  };
  all[index] = updatedSubtask;
  await setData(SUBTASKS_KEY, all);
  const action = updatedSubtask.completed ? "completed" : "uncompleted";
  await addHistoryItem("subtask", id, action, oldSubtask, updatedSubtask);
  await recalcProjectProgress(updatedSubtask.projectId);
  return updatedSubtask;
};
