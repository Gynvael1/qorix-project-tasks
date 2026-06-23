import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { getAllProjects } from "../storage/projectStorage";
import { getAllSubtasksForProject } from "../storage/subtaskStorage";
import { formatDate } from "../utils/helpers";

const generateCSV = (projects: any[]): string => {
  const headers = [
    "Название проекта",
    "Клиент",
    "Статус",
    "Прогресс (%)",
    "Дедлайн",
    "Количество подзадач",
  ];

  const rows = projects.map((p) => [
    `"${String(p.projectName || "").replace(/"/g, '""')}"`,
    `"${String(p.clientName || "").replace(/"/g, '""')}"`,
    p.status,
    p.progress,
    formatDate(p.deadline),
    p.subtaskCount,
  ]);

  const content = [headers.join(","), ...rows.map((row) => row.join(","))].join(
    "\r\n",
  );

  // BOM для корректного открытия UTF-8 в Excel
  return "\uFEFF" + content;
};

export const exportProjectsToCSV = async (): Promise<string | null> => {
  try {
    const projects = await getAllProjects();

    if (projects.length === 0) {
      return null;
    }

    const projectsWithCount = await Promise.all(
      projects.map(async (project) => {
        const subtasks = await getAllSubtasksForProject(project.id);

        return {
          ...project,
          subtaskCount: subtasks.length,
        };
      }),
    );

    const csv = generateCSV(projectsWithCount);

    const fileName = `qorix_projects_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    const file = new File(Paths.cache, fileName);

    await file.write(csv, {
      encoding: "utf8",
    });

    if (!(await Sharing.isAvailableAsync())) {
      return file.uri;
    }

    await Sharing.shareAsync(file.uri, {
      mimeType: "text/csv;charset=utf-8",
      dialogTitle: "Экспорт проектов в CSV",
      UTI: "public.comma-separated-values-text",
    });

    return file.uri;
  } catch (error) {
    console.error("Ошибка экспорта:", error);
    return null;
  }
};
