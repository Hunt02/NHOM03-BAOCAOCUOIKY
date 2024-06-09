import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import Icon from FontAwesome

const ForgetPassWord = ({ navigation }) => {
    const [email, setEmail] = useState('');

    const handleResetPassword = async () => {
        if (email.trim() === '') {
            Alert.alert('Thông báo', 'Vui lòng nhập email');
            return;
        }
        try {
            await auth().sendPasswordResetEmail(email);
            Alert.alert('Thông báo', 'Đã gửi email đặt lại mật khẩu');
            navigation.goBack();
        } catch (error) {
            console.error('Error resetting password:', error);
            Alert.alert('Error', 'Có lỗi xảy ra, vui lòng thử lại');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Quên mật khẩu</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
                <Icon name="arrow-left" size={25} color="black" />
            </TouchableOpacity>
            <TextInput
                style={styles.input}
                placeholder="Nhập email của bạn"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TouchableOpacity style={styles.btn} onPress={handleResetPassword}>
                <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',

    },
    iconContainer: {
        position: 'absolute',
        top: 40,
        left: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        borderRadius: 12,
        fontSize: 15,
        fontWeight: '500',
        color: '#222',
        borderWidth: 1,
        borderColor: '#C9D3DB',
        borderStyle: 'solid',
        marginBottom: 20,
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
        backgroundColor: 'black',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 31,
        fontWeight: '700',
        color: 'black',
        marginBottom: 6,
        marginTop: -400,
        alignItems: 'center',
    },
});

export default ForgetPassWord;
