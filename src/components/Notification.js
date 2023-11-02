import React from 'react'

import { View } from 'react-native'
import { showMessage } from 'react-native-flash-message'

export default function ErrorNotification(type, title) {
	function openAlert() {
		showMessage({
			message: title,
			type: type == 'success' ? type : 'danger'
		})
	}
	return <View onPress={openAlert()} />
}
