import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import PaymentWebView from './PaymentWebView';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createStackNavigator } from '@react-navigation/stack';
import Details from './Details'

const CartScreen = () => {
    const navigation = useNavigation();
    const [bookings, setBookings] = useState([]);
    const [selectedItems, setSelectedItems] = useState({});
    const [creatorName, setCreatorName] = useState('');
    const [bookingSaved, setBookingSaved] = useState(false);

    useEffect(() => {
        const unsubscribe = firestore().collection('cart').onSnapshot(querySnapshot => {
            const bookingsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBookings(bookingsData);
        });

        return () => unsubscribe();
    }, []);

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

    const handleSaveBooking = async (selectedBooking, method) => {
        try {
            const currentUser = auth().currentUser;
            if (currentUser) {
                const { uid, displayName } = currentUser;
                const { quantity, price, serviceName, imageUrl } = selectedBooking;
                const totalPrice = price * quantity;

                await firestore().collection('Bill').add({
                    userId: uid,
                    name: displayName || creatorName,
                    serviceName,
                    prices: price,
                    imageUrl,
                    quantity,
                    totalPrice,
                    creatorName,
                    paymentMethod: method,
                });

                setBookingSaved(true);

                if (method === 'cod') {
                    Alert.alert('Thông báo', 'Đặt hàng thành công');
                    navigation.navigate('Trang chủ'); // Change this to the appropriate screen name
                }
            } else {
                Alert.alert('Lỗi', 'Người dùng chưa đăng nhập');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể lưu đặt hàng');
        }
    };

    const deleteBooking = async (id) => {
        try {
            await firestore().collection('cart').doc(id).delete();
            Alert.alert('Thông báo', 'Xoá thành công khỏi giỏ hàng');
        } catch (error) {
            Alert.alert('Error', 'Failed to delete booking');
        }
    };

    const handleZaloPayPayment = async () => {
        try {
            const totalPrice = calculateTotalPrice();
            const paymentUrl = await createPaymentUrl(totalPrice);
            if (paymentUrl) {
                const selectedIds = Object.keys(selectedItems).filter(key => selectedItems[key]);
                for (const id of selectedIds) {
                    const selectedBooking = bookings.find(booking => booking.id === id);
                    if (selectedBooking) {
                        await handleSaveBooking(selectedBooking, 'online');
                    }
                }

                // Clear cart after successful ZaloPay payment
                await clearCart();

                navigation.navigate('PaymentWebView', { url: paymentUrl });
            }
        } catch (error) {
            console.error('Error occurred while processing ZaloPay payment:', error);
            Alert.alert('Lỗi', 'Không thể thực hiện thanh toán ZaloPay');
        }
    };

    const handlePayment = () => {
        const selectedIds = Object.keys(selectedItems).filter(key => selectedItems[key]);
        if (selectedIds.length === 0) {
            Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một sản phẩm để thanh toán');
            return;
        }

        Alert.alert(
            'Chọn phương thức thanh toán',
            'Vui lòng chọn phương thức thanh toán',
            [
                { text: 'ZaloPay', onPress: handleZaloPayPayment },
                { text: 'Thanh toán khi nhận hàng', onPress: () => processPayment('cod') },
            ],
            { cancelable: true }
        );
    };

    const processPayment = async (method) => {
        try {
            const currentUser = auth().currentUser;
            if (!currentUser) {
                Alert.alert('Lỗi', 'Người dùng chưa đăng nhập');
                return;
            }

            const selectedIds = Object.keys(selectedItems).filter(key => selectedItems[key]);
            for (const id of selectedIds) {
                const selectedBooking = bookings.find(booking => booking.id === id);
                if (selectedBooking) {
                    await handleSaveBooking(selectedBooking, method);
                    await firestore().collection('cart').doc(id).delete();
                }
            }

            setSelectedItems({});
            Alert.alert('Thông báo', 'Đặt hàng thành công!');
            navigation.navigate('Trang chủ');
        } catch (error) {
            Alert.alert('Lỗi', 'Thanh toán thất bại');
        }
    };

    const createPaymentUrl = async (totalPrice) => {
        const apiUrl = 'http://172.20.10.6:3000/payment';
        const requestData = { amount: totalPrice };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) throw new Error('Failed to create payment URL');

            const responseData = await response.json();
            return responseData.order_url;
        } catch (error) {
            console.error('Error occurred while creating payment URL:', error);
            Alert.alert('Lỗi', 'Không thể tạo URL thanh toán');
        }
    };

    const clearCart = async () => {
        try {
            const selectedIds = Object.keys(selectedItems).filter(key => selectedItems[key]);
            for (const id of selectedIds) {
                await firestore().collection('cart').doc(id).delete();
            }
            setSelectedItems({});
        } catch (error) {
            console.error('Error occurred while clearing cart:', error);
            Alert.alert('Lỗi', 'Không thể xóa giỏ hàng');
        }
    };

    const toggleCheckbox = (id) => {
        setSelectedItems(prevState => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };

    const calculateTotalPrice = () => {
        const selectedIds = Object.keys(selectedItems).filter(key => selectedItems[key]);
        return selectedIds.reduce((total, id) => {
            const selectedBooking = bookings.find(booking => booking.id === id);
            return total + (selectedBooking ? selectedBooking.price * selectedBooking.quantity : 0);
        }, 0);
    };

    const formatPrice = (price) => {
        const priceNumber = Number(price);
        return priceNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' VND';
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <TouchableOpacity onPress={() => toggleCheckbox(item.id)} style={styles.checkboxContainer}>
                    <Icon name={selectedItems[item.id] ? "check-square-o" : "square-o"} size={24} color="black" />
                </TouchableOpacity>
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
                <View style={styles.textContainer}>
                    <Text style={styles.bookingText}>Tên sản phẩm: {item.serviceName}</Text>
                    <Text style={styles.bookingText}>Giá: {formatPrice(item.price)}</Text>
                    <Text style={styles.bookingText}>Kích thước: {item.size}</Text>
                    <Text style={styles.bookingText}>Số lượng: {item.quantity}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteBooking(item.id)} style={styles.deleteButton}>
                    <Icon name="trash" size={30} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.textcenter}>Giỏ hàng</Text>
            </View>
            <View style={styles.content}>
                <FlatList
                    style={styles.list}
                    data={bookings}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                />
            </View>
            <View style={styles.footer}>
                <Text style={styles.totalPriceText}>Tổng số tiền: {formatPrice(calculateTotalPrice())}</Text>
                <TouchableOpacity style={styles.footerButton} onPress={handlePayment}>
                    <Icon name="money" size={20} color="white" />
                    <Text style={styles.buttonText}>Thanh toán</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const Stack = createStackNavigator();

const Cart = ({ route }) => {
    return (
        <Stack.Navigator
            initialRouteName="Cart"
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Cart" component={CartScreen} initialParams={route.params} />
            <Stack.Screen name="PaymentWebView" component={PaymentWebView} />

        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#dcdcdc',
    },
    list: {
        width: '100%',
    },
    content: {
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
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
        color: "black",
    },
    deleteButton: {
        backgroundColor: '#ff4500',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginLeft: 'auto',
    },
    textcenter: {
        fontSize: 20,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        color: "black",
        marginLeft: "28%",
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 10,
    },
    imageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
        backgroundColor: 'white',
        height: 60,
    },
    backButton: {
        marginRight: 10,
    },
    checkboxContainer: {
        marginRight: 10,
    },
    totalPriceText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        alignSelf: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        backgroundColor: "white",
        height: 50,
        borderRadius: 20,
    },
    footerButton: {
        backgroundColor: '#ffa500',
        borderRadius: 10,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 10,
        marginLeft: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
    },
});

export default Cart;

