import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';
import { launchImageLibrary } from 'react-native-image-picker';

const AddNewServices = ({ navigation }) => {
    const [service, setService] = useState('');
    const [prices, setPrices] = useState('');
    const [description, setDescription] = useState('');
    const [imageUri, setImageUri] = useState(null);
    const [creatorName, setCreatorName] = useState('');
    const [loading, setLoading] = useState(false); // Thêm trạng thái loading

    useEffect(() => {
        const fetchUserData = async () => {
            const currentUser = auth().currentUser;
            if (currentUser) {
                const userDoc = await firestore().collection('user').doc(currentUser.uid).get();
                if (userDoc.exists) {
                    setCreatorName(userDoc.data().name);
                }
            }
        };
        fetchUserData();
    }, []);

    const pickImage = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorMessage) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                const selectedImage = response.assets[0];
                setImageUri(selectedImage.uri);
            }
        });
    };

    const uploadImage = async (uri) => {
        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
        const storageRef = storage().ref(`services/${filename}`);
        await storageRef.putFile(uploadUri);
        return await storageRef.getDownloadURL();
    };

    const addService = async () => {
        if (service.trim() === '' || prices.trim() === '' || description.trim() === '') {
            Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (loading) return; // Kiểm tra nếu đang xử lý thì không cho người dùng bấm nút

        setLoading(true); // Bắt đầu quá trình xử lý

        let imageUrl = '';
        if (imageUri) {
            try {
                imageUrl = await uploadImage(imageUri);
            } catch (error) {
                console.error('Error uploading image:', error);
                Alert.alert('Thông báo', 'Đã có lỗi xảy ra khi tải ảnh');
                setLoading(false); // Dừng quá trình xử lý
                return;
            }
        }

        try {
            await firestore()
                .collection('services')
                .add({
                    service: service.trim(),
                    prices: prices.trim(),
                    description: description.trim(),
                    imageUrl,
                    creatorName,
                });

            Alert.alert('Thông báo', 'Thêm sản phẩm thành công');
            navigation.navigate('Home');
        } catch (error) {
            console.error('Error adding service:', error);
            Alert.alert('Error', 'An error occurred while adding the service');
        } finally {
            setLoading(false); // Dừng quá trình xử lý sau khi hoàn thành
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.topContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <View style={styles.bottomContainer}>
                <Text style={{ fontWeight: 'bold' }}>Tên sản phẩm*</Text>
                <TextInput
                    placeholder="Điền tên sản phẩm"
                    onChangeText={setService}
                    value={service}
                    style={styles.input}
                />

                <Text style={{ fontWeight: 'bold' }}>Giá*</Text>
                <TextInput
                    placeholder="0"
                    onChangeText={setPrices}
                    value={prices}
                    style={styles.input}
                    keyboardType="number-pad"
                />

                <Text style={{ fontWeight: 'bold' }}>Mô tả*</Text>
                <TextInput
                    placeholder="Nhập mô tả sản phẩm"
                    onChangeText={setDescription}
                    value={description}
                    style={styles.input}
                />

                <TouchableOpacity onPress={pickImage} >
                    <Text style={{ fontSize: 15, color: 'blue', textAlign: 'center' }}>Chọn ảnh</Text>
                </TouchableOpacity>

                {imageUri && (
                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                )}

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity onPress={addService} style={[styles.button, loading && styles.disabledButton]} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="white" /> // Hiển thị indicator khi đang xử lý
                        ) : (
                            <Text style={{ fontSize: 20, color: 'white' }}>Thêm</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    input: {
        height: 40,
        width: '100%',
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    topContainer: {
        justifyContent: 'flex-start',
        alignSelf: 'stretch',
        backgroundColor: '#FFC0CB',
    },
    bottomContainer: {
        width: '100%',
        paddingHorizontal: 10,
        marginTop: 50,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
        height: 45,
        backgroundColor: 'black',
        marginTop: 10,
    },
    disabledButton: {
        opacity: 0.5, // Điều chỉnh độ mờ của nút khi bị vô hiệu hóa
    },
    buttonsContainer: {
        marginTop: 10,
    },
    backButton: {
        position: 'absolute',
        left: 10,
        top: 10,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        marginTop: 10,
        borderRadius: 10,
    },
});

export default AddNewServices;
