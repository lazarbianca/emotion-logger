import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";

const App = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [fileUri, setFileUri] = useState("");
  const [lastPressedTime, setLastPressedTime] = useState(Date.now());

  const buttons = [
    { color: "#f5c449", text: "Happy" },
    { color: "#d6443a", text: "Angry" },
    { color: "#2523a6", text: "Sad" },
    { color: "#a3a3a3", text: "Neutral" },
  ];

  // Trigger vibration
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastPressedTime > 60000) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); // Short vibration
      }
    }, 1000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [lastPressedTime]);

  const saveLog = async (buttonText: string) => {
    // Get the current timestamp
    const timestamp = new Date().toISOString();
    // Prepare the log entry
    const logEntry = `${buttonText}: ${timestamp}\n`;

    try {
      // Get the file path
      const filePath = FileSystem.documentDirectory + "logs.txt";
      // Check if the file exists
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists) {
        // If file doesn't exist, create it and write the log entry
        await FileSystem.writeAsStringAsync(filePath, logEntry, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      } else {
        // If file exists, read the current content and append the new log entry
        const currentContent = await FileSystem.readAsStringAsync(filePath);
        const updatedContent = currentContent + logEntry;
        await FileSystem.writeAsStringAsync(filePath, updatedContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }
      // Set the file URI for retrieval or download
      setFileUri(filePath);
      setLastPressedTime(Date.now());
      console.log("Log saved!");
    } catch (error) {
      console.error("Error saving log:", error);
    }
  };

  const downloadFile = async () => {
    if (!fileUri) {
      Alert.alert("Error", "No file to download.");
      return;
    }
    // Check if file exists, then share or allow downloading
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      try {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
          console.log("Sharing file...");
        } else {
          Alert.alert("Sharing not available on this device.");
        }
      } catch (error) {
        console.error("Error sharing file:", error);
        Alert.alert("Error", "Could not share the file.");
      }
    } else {
      Alert.alert("Error", "File does not exist.");
    }
  };

  // Function to reset logs
  const resetLogs = async () => {
    try {
      const filePath = FileSystem.documentDirectory + "logs.txt";
      // Write an empty string to the file, effectively clearing it
      await FileSystem.writeAsStringAsync(filePath, "", {
        encoding: FileSystem.EncodingType.UTF8,
      });
      setLogs([]); // Clear the logs state
      setFileUri(""); // Reset the file URI
      Alert.alert("Logs Reset", "All previous logs have been cleared.");
      console.log("Logs have been reset!");
    } catch (error) {
      console.error("Error resetting logs:", error);
      Alert.alert("Error", "Could not reset the logs.");
    }
  };

  return (
    <View style={styles.buttonContainer}>
      {buttons.map((buttonText, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.button, { backgroundColor: buttonText.color }]}
          onPress={() => saveLog(buttonText.text)}
        >
          <Text style={styles.buttonText}>{buttonText.text}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.downloadButtonContainer}>
        <Button
          title="Download Logs"
          onPress={downloadFile}
          disabled={!fileUri}
          color={"#545454"}
        />
        <Button title="Reset" onPress={resetLogs} color={"#6e6e6e"} />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
    backgroundColor: "#1f1f1f",
  },
  button: {
    width: "50%",
    height: 370,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 1)", // Shadow color
    textShadowOffset: { width: 2, height: 2 }, // Shadow offset
    textShadowRadius: 8, // Shadow radius (spread)
  },
  downloadButtonContainer: {
    marginLeft: 100,
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

export default App;
