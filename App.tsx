import React, { useState, useEffect } from 'react'
import {
	SafeAreaView,
	StyleSheet,
	Text,
	View,
	TextInput,
	Button,
	FlatList,
	TouchableOpacity,
	Platform
} from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import { showMessage, hideMessage } from 'react-native-flash-message'

function Notification(type, title) {
	function openAlert() {
		showMessage({
			message: title,
			type: type == 'success' ? type : 'danger'
		})
	}
	return <View onPress={openAlert()} />
}

export default function App() {
	const [todos, setTodos] = useState([])
	const [textInput, setTextInput] = useState('')

	// Add a new ToDo
	const addTodo = () => {
		// Checking for Biometric
		handleAuthentication()
		//adding todo
		const newTodo = {
			id: Date.now().toString(),
			text: textInput
		}
		setTodos([...todos, newTodo])
		setTextInput('')
	}

	// Delete a ToDo
	const deleteTodo = (id) => {
		setTodos(todos.filter((todo) => todo.id !== id))
	}

	// Check if FaceID is available
	const checkDeviceForHardware = async () => {
		let compatible = await LocalAuthentication.hasHardwareAsync()
		if (compatible) {
			Notification('success', 'Compatible Device. Biometric Authentication is possible.')
			// Check what types of biometrics are available
			let biometricTypes = await LocalAuthentication.supportedAuthenticationTypesAsync()
			if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
				Notification('success', 'FaceID is supported on this device.')
			}
		} else {
			Notification('error', 'Current device does not support biometric authentication.')
		}
	}

	// Function to perform the authentication
	const handleAuthentication = async () => {
		const savedBiometrics = await LocalAuthentication.isEnrolledAsync()
		if (!savedBiometrics) {
			Notification('error', 'No FaceID enrolled. Please set up FaceID on your device.')
			return
		}

		const authentication = await LocalAuthentication.authenticateAsync({
			promptMessage: 'Authenticate with FaceID',
			fallbackLabel: 'Enter Password', // This is for iOS only
			cancelLabel: 'Cancel',
			disableDeviceFallback: true // Set to true to remove passcode fallback
		})

		if (authentication.success) {
			Notification('success', 'FaceID authentication successful!')
			return
		} else {
			Notification('error', 'FaceID authentication failed.')
		}
	}

	// Render each ToDo
	const renderItem = ({ item }) => (
		<View style={styles.todoItem}>
			<Text style={styles.todoText}>{item.text}</Text>
			<TouchableOpacity onPress={() => deleteTodo(item.id)}>
				<Text style={styles.deleteText}>Delete</Text>
			</TouchableOpacity>
		</View>
	)

	useEffect(() => {
		if (Platform.OS === 'ios') {
			checkDeviceForHardware()
		}
	}, [])

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.container}>
				<TextInput
					style={styles.textInput}
					placeholder="Add a new todo..."
					value={textInput}
					onChangeText={setTextInput}
					onSubmitEditing={() => addTodo()}
				/>

				<Text style={styles.header}>Todos </Text>
				<FlatList
					data={todos}
					renderItem={renderItem}
					keyExtractor={(item) => item.id}
					style={styles.list}
				/>
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		backgroundColor: '#1E1E42',
		paddingHorizontal: 20
	},
	textInput: {
		borderWidth: 0,
		backgroundColor: '#2C2C54',
		borderRadius: 10,
		padding: 15,
		marginBottom: 20,
		color: '#fff',
		fontSize: 16,
		paddingLeft: 20,
		paddingRight: 20
	},
	todoItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 15,
		borderRadius: 10,
		backgroundColor: '#2C2C54',
		marginBottom: 10
	},
	todoText: {
		fontSize: 18,
		color: '#fff',
		flex: 4 // to ensure deleteText aligns to the right
	},
	deleteText: {
		fontSize: 16,
		color: '#E94E77',
		flex: 1,
		textAlign: 'right'
	},
	list: {
		marginBottom: 100
	},
	header: {
		fontWeight: 'bold',
		fontSize: 22,
		color: '#E94E77',
		marginBottom: 10
	}
})
