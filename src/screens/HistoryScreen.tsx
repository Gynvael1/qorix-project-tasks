import React, { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getAllHistory } from "../storage/historyStorage";
import { getAllProjects } from "../storage/projectStorage";
import { HistoryItem, Project } from "../types";
import { formatDateTime } from "../utils/helpers";

type ProjectMap = Map<string, string>;

const HistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [projectMap, setProjectMap] = useState<ProjectMap>(new Map());

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    const projects = await getAllProjects();
    const map = new Map<string, string>();
    projects.forEach((p: Project) => map.set(p.id, p.projectName));
    setProjectMap(map);

    const items = await getAllHistory();
    items.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    setHistory(items);
  };

  const getEntityName = (item: HistoryItem): string => {
    if (item.entityType === "project") {
      const obj = item.newValue || item.oldValue;
      return obj?.projectName || "без названия";
    } else {
      const obj = item.newValue || item.oldValue;
      return obj?.title || "без названия";
    }
  };

  const getProjectNameForSubtask = (item: HistoryItem): string | null => {
    if (item.entityType !== "subtask") return null;
    const obj = item.newValue || item.oldValue;
    const projectId = obj?.projectId;
    if (!projectId) return null;
    return projectMap.get(projectId) || null;
  };

  const getActionColor = (action: string): string => {
    switch (action) {
      case "created":
        return "#A7B8A1";
      case "completed":
        return "#A7B8A1";
      case "updated":
        return "#C4CBD6";
      case "deleted":
        return "#D8B4B4";
      case "uncompleted":
        return "#D7C8A5";
      default:
        return "#C4CBD6";
    }
  };

  const formatActionDescription = (item: HistoryItem): string => {
    const { entityType, action, oldValue, newValue } = item;
    const entityName = getEntityName(item);

    switch (action) {
      case "created":
        return `${entityType === "project" ? "Проект" : "Подзадача"} "${entityName}" создан${entityType === "subtask" ? "а" : ""}`;

      case "deleted":
        return `${entityType === "project" ? "Проект" : "Подзадача"} "${entityName}" удалён${entityType === "subtask" ? "а" : ""}`;

      case "completed":
        return `Подзадача "${entityName}" отмечена выполненной`;

      case "uncompleted":
        return `Выполнение подзадачи "${entityName}" отменено`;

      case "updated": {
        if (!oldValue || !newValue) return "Обновлено";
        const changes: string[] = [];
        const keys = new Set([
          ...Object.keys(oldValue),
          ...Object.keys(newValue),
        ]);
        const ignoreKeys = [
          "id",
          "createdAt",
          "updatedAt",
          "projectId",
          "weight",
          "completed",
        ];

        const fieldNames: Record<string, string> = {
          projectName: "название проекта",
          clientName: "клиент",
          description: "описание",
          deadline: "дедлайн",
          title: "название",
          difficulty: "сложность",
          status: "статус",
          progress: "прогресс",
        };

        for (const key of keys) {
          if (ignoreKeys.includes(key)) continue;
          const oldVal = oldValue[key];
          const newVal = newValue[key];
          if (oldVal !== newVal) {
            const field = fieldNames[key] || key;
            changes.push(`${field}: "${oldVal}" → "${newVal}"`);
          }
        }

        if (changes.length === 0) return "Обновлено (без изменений)";
        const type = entityType === "project" ? "Проект" : "Подзадача";
        return `${type} "${entityName}" изменён: ${changes.join("; ")}`;
      }

      default:
        return `${entityType} ${action}`;
    }
  };

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const entityLabel =
      item.entityType === "project"
        ? `Проект "${getEntityName(item)}"`
        : `Подзадача "${getEntityName(item)}"` +
          (() => {
            const projectName = getProjectNameForSubtask(item);
            return projectName ? ` (Проект "${projectName}")` : "";
          })();

    const description = formatActionDescription(item);
    const color = getActionColor(item.action);

    return (
      <View style={styles.itemContainer}>
        <View style={styles.colorBarContainer}>
          <View style={[styles.colorBar, { backgroundColor: color }]} />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.entity}>{entityLabel}</Text>
          <Text style={styles.timestamp}>{formatDateTime(item.timestamp)}</Text>
          <Text style={styles.action}>{description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>История изменений пуста</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
  },
  list: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    marginBottom: 10,
    overflow: "hidden",
    shadowColor: "#2D3440",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  colorBarContainer: {
    width: 6,
    backgroundColor: "#F4F5F7",
  },
  colorBar: {
    flex: 1,
    width: 6,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  itemContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 14,
  },
  entity: {
    fontWeight: "600",
    color: "#2D3440",
    fontSize: 15,
  },
  timestamp: {
    color: "#7B8594",
    fontSize: 12,
    marginTop: 2,
  },
  action: {
    color: "#2D3440",
    fontSize: 14,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#7B8594",
  },
});

export default HistoryScreen;
