import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [textInput, setTextInput] = useState('');

  // Add a new ToDo
  const addTodo = () => {
    // Checking for Biometric
    handleAuthentication();
    //adding todo
    const newTodo = {
      id: Date.now().toString(),
      text: textInput,
    };
    setTodos([...todos, newTodo]);
    setTextInput('');
  };

  // Delete a ToDo
  const deleteTodo = id => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Check if FaceID is available
  const checkDeviceForHardware = async () => {
    let compatible = await LocalAuthentication.hasHardwareAsync();
    if (compatible) {
      console.log('Compatible Device. Biometric Authentication is possible.');
      // Check what types of biometrics are available
      let biometricTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (
        biometricTypes.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
        )
      ) {
        console.log('FaceID is supported on this device.');
      }
    } else {
      console.log('Current device does not support biometric authentication.');
    }
  };

  // Function to perform the authentication
  const handleAuthentication = async () => {
    const savedBiometrics = await LocalAuthentication.isEnrolledAsync();
    if (!savedBiometrics) {
      console.log('No FaceID enrolled. Please set up FaceID on your device.');
      return;
    }

    const authentication = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate with FaceID',
      fallbackLabel: 'Enter Password', // This is for iOS only
      cancelLabel: 'Cancel',
      disableDeviceFallback: true, // Set to true to remove passcode fallback
    });

    if (authentication.success) {
      console.log('FaceID authentication successful!');
    } else {
      console.log('FaceID authentication failed.');
    }
  };

  // Render each ToDo
  const renderItem = ({item}) => (
    <View style={styles.todoItem}>
      <Text style={styles.todoText}>{item.text}</Text>
      <TouchableOpacity onPress={() => deleteTodo(item.id)}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    if (Platform.OS === 'ios') {
      checkDeviceForHardware();
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Button title="Login with FaceID" onPress={handleAuthentication} />
      <View style={styles.container}>
        <TextInput
          style={styles.textInput}
          placeholder="Add a new todo..."
          value={textInput}
          onChangeText={setTextInput}
        />
        <Button title="Add ToDo" onPress={addTodo} />
        <FlatList
          data={todos}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.list}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  todoText: {
    fontSize: 18,
  },
  deleteText: {
    fontSize: 18,
    color: 'red',
  },
  list: {
    marginBottom: 100,
  },
});
