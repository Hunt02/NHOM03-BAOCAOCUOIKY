import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import HeaderCustomer from './HeaderCustomer';
import Icon from 'react-native-vector-icons/FontAwesome';

const AppointmentCustomer = () => {
    const navigation = useNavigation();
    const [bookings, setBookings] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribeAuth = auth().onAuthStateChanged(user => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (user) {
            const unsubscribe = firestore()
                .collection('Bill')
                .where('userId', '==', user.uid)
                .onSnapshot(querySnapshot => {
                    const bookingsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setBookings(bookingsData);
                });

            return () => unsubscribe();
        }
    }, [user]);

    const confirmDeleteBooking = (id) => {
        Alert.alert(
            'Xác nhận xoá',
            'Bạn có chắc chắn muốn huỷ đơn hàng này không?',
            [
                {
                    text: 'Không',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Có',
                    onPress: () => deleteBooking(id),
                },
            ],
            { cancelable: false }
        );
    };

    const deleteBooking = async (id) => {
        try {
            await firestore().collection('Bill').doc(id).delete();
            Alert.alert('Thông báo', 'Đơn hàng đã được huỷ thành công');
        } catch (error) {
            console.error('Error deleting booking: ', error);
            Alert.alert('Error', 'Failed to delete booking');
        }
    };

    return (
        <View style={styles.container}>
            <HeaderCustomer />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Các đơn hàng của bạn</Text>
                <FlatList
                    data={bookings}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <View style={styles.card}>
                            <View style={styles.cardContent}>
                                <Text style={styles.serialNumber}>{index + 1}.</Text>
                                <Image source={{ uri: item.imageUrl }} style={styles.image} />
                                <View style={styles.textContainer}>
                                    <Text style={styles.bookingText}>Tên sản phẩm: {item.serviceName}</Text>
                                    <Text style={styles.bookingText}>Ngày đặt: {item.bookingDate}</Text>
                                    <Text style={styles.bookingText}>Giờ: {item.bookingTime}</Text>
                                    <Text style={styles.bookingText}>Giá: {item.prices} VND</Text>
                                    <Text style={styles.bookingText}>Số lượng: {item.quantity}</Text>
                                    <Text style={styles.bookingText}>Tổng tiền: {item.totalPrice} VND</Text>
                                </View>
                                <TouchableOpacity onPress={() => confirmDeleteBooking(item.id)} style={styles.deleteButton}>
                                    <Icon name="trash" size={30} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        marginTop: 20,
    },
    list: {
        width: '100%',
    },
    content: {
        padding: 20,
    },
    card: {
        backgroundColor: '#f5f5f5',
        borderRadius: 30,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        marginLeft: 10,
    },
    bookingText: {
        fontSize: 16,
        marginBottom: 5,
    },
    deleteButton: {
        backgroundColor: 'red',
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderRadius: 5,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 10,
    },
    serialNumber: {
        fontWeight: 'bold',
        marginRight: 10,
    },
});

export default AppointmentCustomer;
