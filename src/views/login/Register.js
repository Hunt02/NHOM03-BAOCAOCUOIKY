import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, SafeAreaView, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker'; // Import image picker
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function Register({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repassword, setRepassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [avatar, setAvatar] = useState(null); // State for storing the avatar

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleRegister = async () => {
        if (!isValidEmail(email)) {
            Alert.alert('Email không hợp lệ', 'Vui lòng nhập địa chỉ email hợp lệ.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Mật khẩu không hợp lệ', 'Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        if (password !== repassword) {
            Alert.alert('Mật khẩu và mật khẩu nhập lại không khớp');
            return;
        }
        if (phoneNumber.trim() === '') {
            Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại của bạn');
            return;
        }

        setLoading(true);

        try {
            // Create user with email and password
            const userCredential = await auth().createUserWithEmailAndPassword(email, password);

            // Get the user id
            const { uid } = userCredential.user;

            // Upload avatar to Firebase Storage
            let avatarUrl = '';
            if (avatar) {
                const avatarRef = storage().ref(`avatars/${uid}.jpg`);
                await avatarRef.putFile(avatar);
                avatarUrl = await avatarRef.getDownloadURL();
            }

            // Add user details to Firestore
            await firestore()
                .collection('user')
                .doc(uid) // Use the user id as the document id
                .set({
                    email: email,
                    name: name,
                    phoneNumber: phoneNumber,
                    avatar: avatarUrl,
                    role: 'user'
                });

            Alert.alert('Đăng ký thành công');
            navigation.navigate('Login');
        } catch (error) {
            console.error('Lỗi đăng ký', error);
            Alert.alert('Đã có lỗi xảy ra khi đăng ký', error.message);
        } finally {
            setLoading(false);
        }
    };

    const selectAvatar = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorMessage) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else {
                setAvatar(response.assets[0].uri);
            }
        });
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };
    const toggleResetShowPassword = () => {
        setShowResetPassword(!showResetPassword);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled">
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Image
                            resizeMode="contain"
                            style={styles.headerImg}
                            source={require('../../image/LOGO.png')} />
                        <Text style={styles.title}>
                            <Text style={{ color: '#FFC0CB', fontSize: 50 }}>Đăng Ký</Text>
                        </Text>
                    </View>
                    <View style={styles.form}>
                        <View style={styles.input}>
                            <Text style={styles.inputLabel}>Địa chỉ email</Text>
                            <TextInput
                                autoCapitalize="none"
                                autoCorrect={false}
                                clearButtonMode="while-editing"
                                keyboardType="email-address"
                                onChangeText={setEmail}
                                placeholder="john@example.com"
                                placeholderTextColor="#6b7280"
                                style={styles.inputControl}
                                value={email} />
                        </View>
                        <View style={styles.input}>
                            <Text style={styles.inputLabel}>Mật khẩu</Text>
                            <TextInput
                                autoCorrect={false}
                                clearButtonMode="while-editing"
                                onChangeText={setPassword}
                                placeholder="********"
                                placeholderTextColor="#6b7280"
                                style={styles.inputControl}
                                secureTextEntry={!showPassword}
                                value={password} />
                            <TouchableOpacity onPress={toggleShowPassword} style={styles.passwordToggle}>
                                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️'}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.input}>
                            <Text style={styles.inputLabel}>Điền lại mật khẩu</Text>
                            <TextInput
                                autoCorrect={false}
                                clearButtonMode="while-editing"
                                onChangeText={setRepassword}
                                placeholder="********"
                                placeholderTextColor="#6b7280"
                                style={styles.inputControl}
                                secureTextEntry={!showResetPassword}
                                value={repassword} />
                            <TouchableOpacity onPress={toggleResetShowPassword} style={styles.passwordToggle}>
                                <Text style={styles.eyeIcon}>{showResetPassword ? '👁️' : '👁️'}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.input}>
                            <Text style={styles.inputLabel}>Họ và tên</Text>
                            <TextInput
                                autoCapitalize="words"
                                autoCorrect={false}
                                clearButtonMode="while-editing"
                                onChangeText={setName}
                                placeholder="John Doe"
                                placeholderTextColor="#6b7280"
                                style={styles.inputControl}
                                value={name} />
                        </View>
                        <View style={styles.input}>
                            <Text style={styles.inputLabel}>Số Điện Thoại</Text>
                            <TextInput
                                autoCapitalize="none"
                                autoCorrect={false}
                                clearButtonMode="while-editing"
                                onChangeText={setPhoneNumber}
                                placeholder="Số điện thoại của bạn"
                                placeholderTextColor="#6b7280"
                                style={styles.inputControl}
                                keyboardType="phone-pad"
                                value={phoneNumber} />
                        </View>
                        <View style={styles.input}>

                            <TouchableOpacity onPress={selectAvatar} style={styles.avatarButton}>
                                <Text style={styles.avatarButtonText}>Chọn ảnh</Text>
                            </TouchableOpacity>
                            {avatar && (
                                <Image source={{ uri: avatar }} style={styles.avatarPreview} />
                            )}
                        </View>
                        <TouchableOpacity onPress={handleRegister} disabled={loading}>
                            <View style={styles.btn}>
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.btnText}>Đăng kí</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
                            <Text style={{ color: 'black', textAlign: 'center', marginTop: 5, fontSize: 20 }}>Quay lại</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 24,
        paddingHorizontal: 0,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 31,
        fontWeight: '700',
        color: '#FFC0CB',
        marginBottom: 6,
    },
    header: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 36,
    },
    headerImg: {
        width: 500,
        height: 150,
        alignSelf: 'center',
        marginTop: -30
    },
    form: {
        marginBottom: 24,
        paddingHorizontal: 24,
    },
    formLink: {
        fontSize: 16,
        fontWeight: '600',
        color: '#075eec',
        textAlign: 'center',
        marginTop: 12,
    },
    formFooter: {
        fontSize: 15,
        fontWeight: '600',
        color: '#222',
        textAlign: 'center',
        letterSpacing: 0.15,
    },
    input: {
        marginBottom: 16,
    },
    inputimage: {
        marginBottom: 16,
        backgroundColor: 'white',
    },
    inputLabel: {
        fontSize: 17,
        fontWeight: '600',
        color: '#222',
        marginBottom: 8,
    },
    inputControl: {
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
        flex: 1,
    },
    btn: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
        backgroundColor: 'black',
    },
    btnText: {
        fontSize: 18,
        lineHeight: 26,
        fontWeight: '600',
        color: '#fff',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    passwordToggle: {
        position: 'absolute',
        right: 12,
        top: 12,
        marginTop: 30
    },
    eyeIcon: {
        fontSize: 22,
        color: '#6b7280',
    },
    avatarButton: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    avatarButtonText: {
        color: 'black',
        fontWeight: '600',
        backgroundColor: 'white',
    },
    avatarPreview: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginTop: 10,
        alignSelf: 'center',
    },
});
