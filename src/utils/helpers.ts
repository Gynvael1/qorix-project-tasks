import { SubTask, Difficulty } from "../types";
import { format, parseISO, isAfter } from "date-fns";

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

export const getWeightForDifficulty = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case "LOW":
      return 1;
    case "MEDIUM":
      return 2;
    case "HIGH":
      return 3;
    default:
      return 1;
  }
};

export const calculateProgress = (subtasks: SubTask[]): number => {
  if (subtasks.length === 0) return 0;
  const totalWeight = subtasks.reduce((sum, st) => sum + st.weight, 0);
  const completedWeight = subtasks
    .filter((st) => st.completed)
    .reduce((sum, st) => sum + st.weight, 0);
  return Math.round((completedWeight / totalWeight) * 100);
};

export const getStatusFromProgress = (
  progress: number,
): "NEW" | "IN_PROGRESS" | "COMPLETED" => {
  if (progress === 0) return "NEW";
  if (progress === 100) return "COMPLETED";
  return "IN_PROGRESS";
};

export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), "dd.MM.yyyy");
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    return format(parseISO(dateString), "dd.MM.yyyy HH:mm");
  } catch {
    return dateString;
  }
};

export const isDeadlineSoon = (deadline: string, hours: number): boolean => {
  const now = new Date();
  const deadlineDate = parseISO(deadline);
  const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffHours > 0 && diffHours <= hours;
};
