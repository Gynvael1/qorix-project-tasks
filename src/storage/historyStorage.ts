import { HistoryItem } from "../types";
import { getData, setData } from "./asyncStorage";
import { generateId } from "../utils/helpers";

const HISTORY_KEY = "@qorix_history";

export const getAllHistory = async (): Promise<HistoryItem[]> => {
  const data = await getData<HistoryItem[]>(HISTORY_KEY);
  return data || [];
};

export const addHistoryItem = async (
  entityType: "project" | "subtask",
  entityId: string,
  action: string,
  oldValue: any,
  newValue: any,
): Promise<void> => {
  const history = await getAllHistory();
  const item: HistoryItem = {
    id: generateId(),
    entityType,
    entityId,
    action,
    oldValue,
    newValue,
    timestamp: new Date().toISOString(),
  };
  history.push(item);
  // Сохраняем только последние 500 записей, чтобы не переполнить хранилище
  if (history.length > 500) {
    history.splice(0, history.length - 500);
  }
  await setData(HISTORY_KEY, history);
};

export const clearHistory = async (): Promise<void> => {
  await setData(HISTORY_KEY, []);
};
