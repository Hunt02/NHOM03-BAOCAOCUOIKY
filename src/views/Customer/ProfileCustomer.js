import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const ProfileCustomer = () => {
    const navigation = useNavigation();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = auth().currentUser;

                if (user) {
                    const userDoc = await firestore()
                        .collection('user')
                        .doc(user.uid)
                        .get();

                    if (userDoc.exists) {
                        setUserData(userDoc.data());
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
                <Icon name="arrow-left" size={25} color="black" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Thông tin tài khoản</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <>
                        {userData?.avatar && (
                            <Image source={{ uri: userData.avatar }} style={styles.avatar} />
                        )}

                        <View style={styles.infoContainer}>
                            <Text style={styles.label}>Email:</Text>
                            <Text style={styles.text}>{userData?.email}</Text>
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.label}>Quyền:</Text>
                            <Text style={styles.text}>{userData?.role}</Text>
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.label}>Họ và tên:</Text>
                            <Text style={styles.text}>{userData?.name}</Text>
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.label}>Số điện thoại:</Text>
                            <Text style={styles.text}>{userData?.phoneNumber}</Text>
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    iconContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1,
    },
    content: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#ccc',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    infoContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        width: '100%',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#555',
    },
    text: {
        fontSize: 20,
        color: '#555',
    },
});

export default ProfileCustomer;
