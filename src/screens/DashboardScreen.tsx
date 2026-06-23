import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { getAllProjects } from "../storage/projectStorage";
import { getAllHistory } from "../storage/historyStorage";
import { Project, HistoryItem } from "../types";
import { formatDateTime } from "../utils/helpers";
import { RootStackParamList } from "../navigation";

type DashboardNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  const [totalProjects, setTotalProjects] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [completedProjects, setCompletedProjects] = useState(0);
  const [overdueProjects, setOverdueProjects] = useState(0);
  const [averageProgress, setAverageProgress] = useState(0);
  const [lastActivity, setLastActivity] = useState<HistoryItem | null>(null);
  const [lastProjectName, setLastProjectName] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    const projects = await getAllProjects();
    const now = new Date();

    let total = projects.length;
    let active = projects.filter(
      (p: Project) => p.status === "IN_PROGRESS",
    ).length;
    let completed = projects.filter(
      (p: Project) => p.status === "COMPLETED",
    ).length;
    let overdue = projects.filter(
      (p: Project) => p.status !== "COMPLETED" && new Date(p.deadline) < now,
    ).length;
    let avgProgress =
      total > 0
        ? Math.round(
            projects.reduce((sum: number, p: Project) => sum + p.progress, 0) /
              total,
          )
        : 0;

    setTotalProjects(total);
    setActiveProjects(active);
    setCompletedProjects(completed);
    setOverdueProjects(overdue);
    setAverageProgress(avgProgress);

    const history = await getAllHistory();
    if (history.length > 0) {
      const sorted = [...history].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      const latest = sorted[0];
      setLastActivity(latest);
      if (latest.entityType === "project") {
        const obj = latest.newValue || latest.oldValue;
        setLastProjectName(obj?.projectName || "Проект");
      } else {
        const obj = latest.newValue || latest.oldValue;
        const project = projects.find((p: Project) => p.id === obj?.projectId);
        setLastProjectName(project?.projectName || "Подзадача");
      }
    }
  };

  const getTimeAgo = (timestamp: string): string => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "только что";
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    return `${days} д назад`;
  };

  const StatCard: React.FC<{
    label: string;
    value: number | string;
    color?: string;
  }> = ({ label, value, color = "#2D3440" }) => (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const statsData = [
    { label: "Всего проектов", value: totalProjects },
    { label: "Активных", value: activeProjects, color: "#5d82bd" },
    { label: "Завершённых", value: completedProjects, color: "#76b65f" },
    { label: "Просроченных", value: overdueProjects, color: "#ba6666" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Статистика</Text>
      <View style={styles.statsGrid}>
        {statsData.map((stat, index) => (
          <StatCard
            key={index}
            label={stat.label}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </View>

      <View style={styles.centeredStatContainer}>
        <StatCard
          label="Средний прогресс"
          value={`${averageProgress}%`}
          color="#5d82bd"
        />
      </View>

      <Text style={styles.sectionTitle}>Последняя активность</Text>
      {lastActivity ? (
        <View style={styles.activityCard}>
          <Text style={styles.activityProject}>{lastProjectName}</Text>
          <Text style={styles.activityTime}>
            {getTimeAgo(lastActivity.timestamp)}
          </Text>
          <Text style={styles.activityAction}>
            {lastActivity.action === "created" && "Создан"}
            {lastActivity.action === "updated" && "Изменён"}
            {lastActivity.action === "deleted" && "Удалён"}
            {lastActivity.action === "completed" && "Выполнен"}
            {lastActivity.action === "uncompleted" && "Отменён"}
          </Text>
        </View>
      ) : (
        <View style={styles.activityCard}>
          <Text style={styles.emptyText}>Нет активности</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.goToProjectsButton}
        onPress={() => navigation.navigate("ProjectList")}
      >
        <Text style={styles.goToProjectsText}>Перейти к проектам →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2D3440",
    marginBottom: 16,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  centeredStatContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    width: "48%",
    marginBottom: 12,
    shadowColor: "#2D3440",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#35568e",
  },
  statLabel: {
    fontSize: 13,
    color: "#7B8594",
    marginTop: 4,
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    shadowColor: "#2D3440",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  activityProject: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3440",
  },
  activityTime: {
    fontSize: 14,
    color: "#7B8594",
    marginTop: 2,
  },
  activityAction: {
    fontSize: 14,
    color: "#8A94A6",
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: "#7B8594",
    textAlign: "center",
    paddingVertical: 8,
  },
  goToProjectsButton: {
    backgroundColor: "#687da3",
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: "center",
  },
  goToProjectsText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DashboardScreen;
