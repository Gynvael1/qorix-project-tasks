import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  DimensionValue,
} from "react-native";
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation";
import { getProjectById, deleteProject } from "../storage/projectStorage";
import {
  getAllSubtasksForProject,
  saveSubtask,
  updateSubtask,
  deleteSubtask,
  toggleSubtaskCompletion,
} from "../storage/subtaskStorage";
import { Project, SubTask } from "../types";
import { formatDate } from "../utils/helpers";
import { validateSubTask } from "../utils/validators";
import SubtaskItem from "../components/SubtaskItem";
import {
  scheduleProjectNotifications,
  cancelProjectNotifications,
} from "../services/notificationService";

type ProjectDetailsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ProjectDetails"
>;
type ProjectDetailsRouteProp = RouteProp<RootStackParamList, "ProjectDetails">;

const getProgressColor = (progress: number): string => {
  if (progress <= 30) return "#b45c5c";
  if (progress <= 70) return "#f9eba6";
  if (progress < 100) return "#5b79a9";
  return "#4b8437";
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

const getStatusColor = (status: string): string => {
  switch (status) {
    case "NEW":
      return "#f9eba6";
    case "IN_PROGRESS":
      return "#517ccb";
    case "COMPLETED":
      return "#48aa25";
    default:
      return "#C4CBD6";
  }
};

const ProjectDetailsScreen: React.FC = () => {
  const navigation = useNavigation<ProjectDetailsNavigationProp>();
  const route = useRoute<ProjectDetailsRouteProp>();
  const { projectId } = route.params;

  const [project, setProject] = useState<Project | null>(null);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<SubTask | null>(null);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [subtaskDescription, setSubtaskDescription] = useState("");
  const [subtaskDifficulty, setSubtaskDifficulty] = useState<
    "LOW" | "MEDIUM" | "HIGH"
  >("LOW");

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSubtask, setSelectedSubtask] = useState<SubTask | null>(null);

  const loadData = async () => {
    const proj = await getProjectById(projectId);
    if (proj) {
      setProject(proj);
    } else {
      Alert.alert("Ошибка", "Проект не найден");
      navigation.goBack();
      return;
    }
    const subs = await getAllSubtasksForProject(projectId);
    setSubtasks(subs);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [projectId]),
  );

  const handleEditProject = () => {
    navigation.navigate("ProjectForm", { projectId });
  };

  const handleDeleteProject = async () => {
    Alert.alert(
      "Удаление проекта",
      "Вы уверены, что хотите удалить проект и все его подзадачи?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            await cancelProjectNotifications(projectId);
            await deleteProject(projectId);
            navigation.goBack();
          },
        },
      ],
    );
  };
  const getDifficultyText = (difficulty: string | undefined): string => {
    switch (difficulty) {
      case "LOW":
        return "Низк.";
      case "MEDIUM":
        return "Сред.";
      case "HIGH":
        return "Высок.";
      default:
        return "—";
    }
  };
  const handleAddSubtask = () => {
    setEditingSubtask(null);
    setSubtaskTitle("");
    setSubtaskDescription("");
    setSubtaskDifficulty("LOW");
    setModalVisible(true);
  };

  const handleEditSubtask = (subtask: SubTask) => {
    setEditingSubtask(subtask);
    setSubtaskTitle(subtask.title);
    setSubtaskDescription(subtask.description);
    setSubtaskDifficulty(subtask.difficulty);
    setModalVisible(true);
  };

  const handleDeleteSubtask = (id: string) => {
    Alert.alert("Удаление подзадачи", "Вы уверены?", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          await deleteSubtask(id);
          await loadData();
        },
      },
    ]);
  };

  const handleToggleSubtask = async (id: string) => {
    await toggleSubtaskCompletion(id);
    await loadData();
  };

  const handleSaveSubtask = async () => {
    const error = validateSubTask({ title: subtaskTitle });
    if (error) {
      Alert.alert("Ошибка", error);
      return;
    }

    try {
      if (editingSubtask) {
        await updateSubtask(editingSubtask.id, {
          title: subtaskTitle,
          description: subtaskDescription,
          difficulty: subtaskDifficulty,
        });
      } else {
        await saveSubtask({
          projectId,
          title: subtaskTitle,
          description: subtaskDescription,
          difficulty: subtaskDifficulty,
        });
      }
      setModalVisible(false);
      await loadData();
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось сохранить подзадачу");
    }
  };

  const handleSubtaskPress = (subtask: SubTask) => {
    setSelectedSubtask(subtask);
    setDetailModalVisible(true);
  };

  if (!project) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  const progressColor = getProgressColor(project.progress);
  const progressWidth: DimensionValue = `${Math.max(0, Math.min(project.progress, 100))}%`;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Информация</Text>
          <Text style={styles.projectName}>{project.projectName}</Text>
          <Text style={styles.clientName}>Клиент: {project.clientName}</Text>
          <Text style={styles.description}>{project.description}</Text>
          <Text style={styles.deadline}>
            Дедлайн: {formatDate(project.deadline)}
          </Text>
          <Text
            style={[styles.status, { color: getStatusColor(project.status) }]}
          >
            Статус: {getStatusText(project.status).toUpperCase()}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Прогресс</Text>
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
        </View>

        <View style={styles.card}>
          <View style={styles.subtasksHeader}>
            <Text style={styles.cardTitle}>Подзадачи ({subtasks.length})</Text>
            <TouchableOpacity
              style={styles.addSubtaskButton}
              onPress={handleAddSubtask}
            >
              <Text style={styles.addSubtaskText}>+ Добавить</Text>
            </TouchableOpacity>
          </View>

          {subtasks.length === 0 ? (
            <Text style={styles.emptyText}>Нет подзадач</Text>
          ) : (
            subtasks.map((st) => (
              <SubtaskItem
                key={st.id}
                subtask={st}
                onToggle={handleToggleSubtask}
                onEdit={handleEditSubtask}
                onDelete={handleDeleteSubtask}
                onPress={handleSubtaskPress}
              />
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Действия</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProject}
            >
              <Text style={styles.buttonText}>Редактировать</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteProject}
            >
              <Text style={styles.buttonText}>Удалить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingSubtask ? "Редактировать подзадачу" : "Новая подзадача"}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Название подзадачи"
              value={subtaskTitle}
              onChangeText={setSubtaskTitle}
              placeholderTextColor="#7B8594"
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Описание"
              value={subtaskDescription}
              onChangeText={setSubtaskDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor="#7B8594"
            />
            <View style={styles.difficultySelector}>
              {(["LOW", "MEDIUM", "HIGH"] as const).map((diff) => (
                <TouchableOpacity
                  key={diff}
                  style={[
                    styles.difficultyOption,
                    subtaskDifficulty === diff &&
                      styles.difficultyOptionSelected,
                  ]}
                  onPress={() => setSubtaskDifficulty(diff)}
                >
                  <Text style={styles.difficultyOptionText}>
                    {getDifficultyText(diff)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSave]}
                onPress={handleSaveSubtask}
              >
                <Text style={styles.modalButtonText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.detailModalOverlay}>
          <View style={styles.detailModalContent}>
            <Text style={styles.detailModalTitle}>
              {selectedSubtask?.title || "Подзадача"}
            </Text>
            <View style={styles.detailMetaRow}>
              <View style={styles.detailBadge}>
                <Text style={styles.detailBadgeText}>
                  Сложность:{" "}
                  {getDifficultyText(selectedSubtask?.difficulty) || "—"}
                </Text>
              </View>
              <Text style={styles.detailWeight}>
                Вес: {selectedSubtask?.weight || 0}
              </Text>
              <Text style={styles.detailStatus}>
                {selectedSubtask?.completed
                  ? "✅ Выполнена"
                  : "⏳ Не выполнена"}
              </Text>
            </View>
            <Text style={styles.detailDescription}>
              {selectedSubtask?.description?.trim() || "Описание отсутствует"}
            </Text>
            <TouchableOpacity
              style={styles.detailCloseButton}
              onPress={() => setDetailModalVisible(false)}
            >
              <Text style={styles.detailCloseText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  loadingText: {
    textAlign: "center",
    color: "#7B8594",
    marginTop: 40,
    fontSize: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#2D3440",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3440",
    marginBottom: 12,
  },
  projectName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2D3440",
    marginBottom: 4,
  },
  clientName: {
    fontSize: 16,
    color: "#7B8594",
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: "#2D3440",
    marginVertical: 8,
  },
  deadline: {
    fontSize: 14,
    color: "#7B8594",
    marginBottom: 2,
  },
  status: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 0,
  },
  progressWrapper: {
    flexDirection: "row",
    alignItems: "center",
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
  subtasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addSubtaskButton: {
    backgroundColor: "#8A94A6",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addSubtaskText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  emptyText: {
    textAlign: "center",
    color: "#7B8594",
    marginTop: 12,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  editButton: {
    backgroundColor: "#8A94A6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    flex: 2,
    marginRight: 8,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#cc6e6e",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 24,
    width: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3440",
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: "#F4F5F7",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E7EAF0",
    marginBottom: 12,
    color: "#2D3440",
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: "top",
  },
  difficultySelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  difficultyOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E7EAF0",
  },
  difficultyOptionSelected: {
    backgroundColor: "#E7EAF0",
    borderColor: "#8A94A6",
  },
  difficultyOptionText: {
    color: "#2D3440",
    fontWeight: "500",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 4,
  },
  modalCancel: {
    backgroundColor: "#8fa0c4",
  },
  modalSave: {
    backgroundColor: "#8A94A6",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  detailModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  detailModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  detailModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D3440",
    marginBottom: 8,
  },
  detailMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  detailBadge: {
    backgroundColor: "#F4F5F7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  detailBadgeText: {
    fontSize: 12,
    color: "#7B8594",
  },
  detailWeight: {
    fontSize: 12,
    color: "#7B8594",
    marginRight: 10,
  },
  detailStatus: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2D3440",
  },
  detailDescription: {
    fontSize: 15,
    color: "#2D3440",
    lineHeight: 22,
    marginBottom: 20,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E7EAF0",
  },
  detailCloseButton: {
    backgroundColor: "#8A94A6",
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  detailCloseText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default ProjectDetailsScreen;
