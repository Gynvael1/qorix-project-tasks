import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation";
import {
  saveProject,
  updateProject,
  getProjectById,
} from "../storage/projectStorage";
import { validateProject } from "../utils/validators";
import { scheduleProjectNotifications } from "../services/notificationService";
import { ProjectType } from "../types";

type ProjectFormNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ProjectForm"
>;
type ProjectFormRouteProp = RouteProp<RootStackParamList, "ProjectForm">;

const PROJECT_TYPES: { value: ProjectType; label: string; icon: string }[] = [
  { value: "WEBSITE", label: "Веб-сайт", icon: "🌐" },
  { value: "SEO", label: "SEO", icon: "📈" },
  { value: "ADS", label: "Реклама", icon: "🎯" },
  { value: "SUPPORT", label: "Поддержка", icon: "⚙️" },
  { value: "ANALYTICS", label: "Аналитика", icon: "📊" },
];

const ProjectFormScreen: React.FC = () => {
  const navigation = useNavigation<ProjectFormNavigationProp>();
  const route = useRoute<ProjectFormRouteProp>();
  const projectId = route.params?.projectId;

  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("WEBSITE");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;
    const project = await getProjectById(projectId);
    if (project) {
      setClientName(project.clientName);
      setProjectName(project.projectName);
      setDescription(project.description);
      setDeadline(project.deadline);
      setProjectType(project.projectType || "WEBSITE");
    }
  };

  const handleSubmit = async () => {
    const newProject = {
      clientName,
      projectName,
      description,
      deadline,
      projectType,
    };
    const error = validateProject(newProject);
    if (error) {
      Alert.alert("Ошибка", error);
      return;
    }

    setLoading(true);
    try {
      let saved;
      if (projectId) {
        const updated = await updateProject(projectId, newProject);
        if (updated) {
          saved = updated;
        } else {
          Alert.alert("Ошибка", "Проект не найден");
          setLoading(false);
          return;
        }
      } else {
        saved = await saveProject(newProject);
      }
      await scheduleProjectNotifications(saved);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось сохранить проект");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.field}>
        <Text style={styles.label}>Клиент *</Text>
        <TextInput
          style={styles.input}
          value={clientName}
          onChangeText={setClientName}
          placeholder="Введите название клиента"
          placeholderTextColor="#7B8594"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Название проекта *</Text>
        <TextInput
          style={styles.input}
          value={projectName}
          onChangeText={setProjectName}
          placeholder="Введите название проекта (мин. 3 симв.)"
          placeholderTextColor="#7B8594"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Тип проекта</Text>
        <View style={styles.typeGrid}>
          {PROJECT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeOption,
                projectType === type.value && styles.typeOptionSelected,
              ]}
              onPress={() => setProjectType(type.value)}
            >
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text
                style={[
                  styles.typeLabel,
                  projectType === type.value && styles.typeLabelSelected,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Описание</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Введите описание проекта"
          placeholderTextColor="#7B8594"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Дедлайн (ГГГГ-ММ-ДД)</Text>
        <TextInput
          style={styles.input}
          value={deadline}
          onChangeText={setDeadline}
          placeholder="Например: 2026-07-15"
          placeholderTextColor="#7B8594"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Сохранение..." : projectId ? "Обновить" : "Создать"}
        </Text>
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
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2D3440",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#2D3440",
    borderWidth: 1,
    borderColor: "#E7EAF0",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeOption: {
    backgroundColor: "#F4F5F7",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E7EAF0",
    marginBottom: 8,
    marginRight: 8,
  },
  typeOptionSelected: {
    backgroundColor: "#E7EAF0",
    borderColor: "#8A94A6",
  },
  typeIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  typeLabel: {
    fontSize: 13,
    color: "#7B8594",
  },
  typeLabelSelected: {
    color: "#2D3440",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#8A94A6",
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProjectFormScreen;
