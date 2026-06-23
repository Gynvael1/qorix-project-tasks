import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
} from "react-native";
import { FAB, Menu } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation";
import { getAllProjects } from "../storage/projectStorage";
import { Project } from "../types";
import ProjectCard from "../components/ProjectCard";

type ProjectListNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ProjectList"
>;

const ProjectListScreen: React.FC = () => {
  const navigation = useNavigation<ProjectListNavigationProp>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const loadProjects = async () => {
    const all = await getAllProjects();
    setProjects(all);
    applyFilters(all, searchQuery, statusFilter);
  };

  const applyFilters = (
    all: Project[],
    query: string,
    status: string | null,
  ) => {
    let filtered = all;
    if (query.trim()) {
      const lower = query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.projectName.toLowerCase().includes(lower) ||
          p.clientName.toLowerCase().includes(lower),
      );
    }
    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }
    setFilteredProjects(filtered);
  };

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, []),
  );

  useEffect(() => {
    applyFilters(projects, searchQuery, statusFilter);
  }, [searchQuery, statusFilter, projects]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilterSelect = (status: string | null) => {
    setStatusFilter(status);
    setMenuVisible(false);
  };

  const handleProjectPress = (project: Project) => {
    navigation.navigate("ProjectDetails", { projectId: project.id });
  };

  const handleAddPress = () => {
    navigation.navigate("ProjectForm");
  };

  const renderItem = ({ item }: { item: Project }) => (
    <ProjectCard project={item} onPress={handleProjectPress} />
  );

  const getFiltrText = (filtr: string): string => {
    switch (filtr) {
      case "NEW":
        return "Новые";
      case "IN_PROGRESS":
        return "В работе";
      case "COMPLETED":
        return "Завершенные";
      default:
        return "";
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по названию или клиенту..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#7B8594"
          />
        </View>
        <View style={styles.filterContainer}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setMenuVisible(true)}
              >
                <Text style={styles.filterButtonText}>
                  {statusFilter
                    ? `Фильтр: ${getFiltrText(statusFilter).toUpperCase()}`
                    : "Фильтр"}
                </Text>
              </TouchableOpacity>
            }
          >
            <Menu.Item onPress={() => handleFilterSelect(null)} title="Все" />
            <Menu.Item
              onPress={() => handleFilterSelect("NEW")}
              title="Новые"
            />
            <Menu.Item
              onPress={() => handleFilterSelect("IN_PROGRESS")}
              title="В работе"
            />
            <Menu.Item
              onPress={() => handleFilterSelect("COMPLETED")}
              title="Завершённые"
            />
          </Menu>
          {statusFilter && (
            <TouchableOpacity
              style={styles.clearFilter}
              onPress={() => handleFilterSelect(null)}
            >
              <Text style={styles.clearFilterText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {filteredProjects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Нет проектов</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProjects}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleAddPress}
        color="#FFFFFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E7EAF0",
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchInput: {
    height: 40,
    backgroundColor: "#F4F5F7",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#2D3440",
    borderWidth: 1,
    borderColor: "#E7EAF0",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    backgroundColor: "#F4F5F7",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E7EAF0",
  },
  filterButtonText: {
    fontSize: 12,
    color: "#2D3440",
  },
  clearFilter: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E7EAF0",
    alignItems: "center",
    justifyContent: "center",
  },
  clearFilterText: {
    fontSize: 14,
    color: "#2D3440",
  },
  list: {
    paddingTop: 8,
    paddingBottom: 80,
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
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#8A94A6",
    borderRadius: 30,
  },
});

export default ProjectListScreen;
