import Constants from "expo-constants";
import { Project } from "../types";
import { formatDate } from "../utils/helpers";
import type { DateTriggerInput } from "expo-notifications";

const isExpoGo = Constants.appOwnership === "expo";

// Динамический импорт expo-notifications (только если не Expo Go)
const getNotifications = async () => {
  if (isExpoGo) {
    return null;
  }
  return await import("expo-notifications");
};

export const requestPermissions = async (): Promise<boolean> => {
  if (isExpoGo) {
    console.log("Expo Go: уведомления недоступны");
    return false;
  }
  const Notifications = await getNotifications();
  if (!Notifications) return false;
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    return newStatus === "granted";
  }
  return true;
};

export const scheduleProjectNotifications = async (
  project: Project,
): Promise<void> => {
  if (isExpoGo) {
    console.log("Expo Go: уведомления не планируются");
    return;
  }
  const Notifications = await getNotifications();
  if (!Notifications) return;

  await cancelProjectNotifications(project.id);

  if (!project.deadline) return;

  const deadlineDate = new Date(project.deadline);
  const now = new Date();

  if (deadlineDate <= now) return;

  const trigger24h = new Date(deadlineDate);
  trigger24h.setHours(trigger24h.getHours() - 24);
  if (trigger24h > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ Дедлайн проекта скоро!",
        body: `Проект "${project.projectName}" (клиент: ${project.clientName}) истекает завтра в ${formatDate(project.deadline)}.`,
        data: { projectId: project.id },
      },
      trigger: { date: trigger24h, type: "date" } as DateTriggerInput,
    });
  }

  const trigger1h = new Date(deadlineDate);
  trigger1h.setHours(trigger1h.getHours() - 1);
  if (trigger1h > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ Дедлайн через час!",
        body: `Проект "${project.projectName}" (клиент: ${project.clientName}) истекает через час в ${formatDate(project.deadline)}.`,
        data: { projectId: project.id },
      },
      trigger: { date: trigger1h, type: "date" } as DateTriggerInput,
    });
  }
};

export const cancelProjectNotifications = async (
  projectId: string,
): Promise<void> => {
  if (isExpoGo) return;
  const Notifications = await getNotifications();
  if (!Notifications) return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter(
    (notif) => notif.content.data?.projectId === projectId,
  );
  for (const notif of toCancel) {
    await Notifications.cancelScheduledNotificationAsync(notif.identifier);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  if (isExpoGo) return;
  const Notifications = await getNotifications();
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
};
