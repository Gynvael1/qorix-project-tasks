import { Project, SubTask } from "../types";

export const validateProject = (project: Partial<Project>): string | null => {
  if (!project.projectName || project.projectName.trim().length < 3) {
    return "Название проекта обязательно и должно содержать минимум 3 символа.";
  }
  if (project.deadline) {
    const now = new Date();
    const deadlineDate = new Date(project.deadline);
    if (deadlineDate < now) {
      return "Дедлайн не может быть раньше текущей даты.";
    }
  }
  return null;
};

export const validateSubTask = (subtask: Partial<SubTask>): string | null => {
  if (!subtask.title || subtask.title.trim().length === 0) {
    return "Название подзадачи обязательно.";
  }
  return null;
};
