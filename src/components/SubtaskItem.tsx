import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Checkbox, IconButton } from "react-native-paper";
import { SubTask } from "../types";

interface SubtaskItemProps {
  subtask: SubTask;
  onToggle: (id: string) => void;
  onEdit: (subtask: SubTask) => void;
  onDelete: (id: string) => void;
  onPress: (subtask: SubTask) => void;
}

type Difficulty = "LOW" | "MEDIUM" | "HIGH";

const difficultyColors: Record<Difficulty, string> = {
  LOW: "#7fb56b",
  MEDIUM: "#f4c964",
  HIGH: "#bb4e4e",
};

const difficultyLabels: Record<Difficulty, string> = {
  LOW: "Низкая",
  MEDIUM: "Средняя",
  HIGH: "Высокая",
};

const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  onToggle,
  onEdit,
  onDelete,
  onPress,
}) => {
  const diff = subtask.difficulty as Difficulty;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.leftContent}
        onPress={() => onPress(subtask)}
        activeOpacity={0.7}
      >
        <Checkbox
          status={subtask.completed ? "checked" : "unchecked"}
          onPress={() => onToggle(subtask.id)}
          color="#8A94A6"
        />
        <View style={styles.textContainer}>
          <Text
            style={[styles.title, subtask.completed && styles.titleCompleted]}
            numberOfLines={1}
          >
            {subtask.title}
          </Text>
          <View style={styles.metaContainer}>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: difficultyColors[diff] },
              ]}
            >
              <Text style={styles.difficultyText}>
                {difficultyLabels[diff]}
              </Text>
            </View>
            <Text style={styles.weightText}>Вес: {subtask.weight}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        <IconButton icon="pencil" size={20} onPress={() => onEdit(subtask)} />
        <IconButton
          icon="delete"
          size={20}
          onPress={() => onDelete(subtask.id)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E7EAF0",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  textContainer: {
    flex: 1,
    marginLeft: 4,
  },
  title: {
    fontSize: 16,
    color: "#2D3440",
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: "#7B8594",
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  difficultyText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  weightText: {
    fontSize: 10,
    color: "#7B8594",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default SubtaskItem;
