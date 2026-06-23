import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  DimensionValue,
} from "react-native";
import { Project } from "../types";
import { formatDate } from "../utils/helpers";

interface ProjectCardProps {
  project: Project;
  onPress: (project: Project) => void;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "NEW":
      return "#b9cf82";
    case "IN_PROGRESS":
      return "#517ccb";
    case "COMPLETED":
      return "#48aa25";
    default:
      return "#C4CBD6";
  }
};
const getStatusText = (status: string): string => {
  switch (status) {
    case "NEW":
      return "Новый";
    case "IN_PROGRESS":
      return "В процессе";
    case "COMPLETED":
      return "Выполнен";
    default:
      return "#C4CBD6";
  }
};

const getProgressColor = (progress: number): string => {
  if (progress <= 30) return "#b45c5c";
  if (progress <= 70) return "#f9eba6";
  if (progress < 100) return "#5b79a9";
  return "#4b8437";
};

const getProjectTypeIcon = (type: string): string => {
  switch (type) {
    case "WEBSITE":
      return "🌐 Веб-сайт";
    case "SEO":
      return "📈 SEO";
    case "ADS":
      return "🎯 Реклама";
    case "SUPPORT":
      return "⚙️ Поддержка";
    case "ANALYTICS":
      return "📊 Аналитика";
    default:
      return "📁";
  }
};

const isOverdue = (project: Project): boolean => {
  if (project.status === "COMPLETED") return false;

  const now = new Date();
  const deadline = new Date(project.deadline);

  return deadline < now;
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress }) => {
  const progressColor = getProgressColor(project.progress);
  const overdue = isOverdue(project);

  const progressWidth: DimensionValue = `${Math.max(0, Math.min(project.progress, 100))}%`;

  return (
    <TouchableOpacity onPress={() => onPress(project)} activeOpacity={0.8}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.projectName}>{project.projectName}</Text>

            {overdue && (
              <View style={styles.overdueBadge}>
                <Text style={styles.overdueText}>ПРОСРОЧЕН</Text>
              </View>
            )}
          </View>

          <View style={styles.typeRow}>
            <Text style={styles.typeIcon}>
              {getProjectTypeIcon(project.projectType)}
            </Text>
          </View>
        </View>

        <Text style={styles.clientName}>{project.clientName}</Text>

        <Text style={styles.deadline}>
          Дедлайн: {formatDate(project.deadline)}
        </Text>

        <View style={styles.progressWrapper}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: progressWidth,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>

          <Text style={styles.progressText}>{project.progress}%</Text>
        </View>

        <View style={styles.statusBadge}>
          <Text
            style={[
              styles.statusText,
              {
                color: getStatusColor(project.status),
              },
            ]}
          >
            {getStatusText(project.status)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    marginHorizontal: 16,
    shadowColor: "#2D3440",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },

  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  projectName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3440",
    marginRight: 8,
    flexShrink: 1,
  },

  overdueBadge: {
    backgroundColor: "#bf3d3d",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
  },

  overdueText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F5F7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },

  typeIcon: {
    fontSize: 14,
    marginRight: 4,
  },

  typeText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#7B8594",
  },

  clientName: {
    fontSize: 14,
    color: "#7B8594",
    marginBottom: 2,
  },

  deadline: {
    fontSize: 12,
    color: "#7B8594",
    marginBottom: 12,
  },

  progressWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  progressTrack: {
    flex: 1,
    height: 10,
    backgroundColor: "#E7EAF0",
    borderRadius: 999,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
  },

  progressText: {
    marginLeft: 12,
    minWidth: 45,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3440",
  },

  statusBadge: {
    alignSelf: "flex-start",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});

export default ProjectCard;
