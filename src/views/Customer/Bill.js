import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import PaymentWebView from './PaymentWebView';
import { createStackNavigator } from '@react-navigation/stack';

const BillVnpay = ({ route }) => {
    const navigation = useNavigation();
    const { serviceName, prices, imageUrl, quantity } = route.params;
    const [creatorName, setCreatorName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' for Cash on Delivery, 'card' for Card Payment

    const totalPrice = prices * quantity;

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

    const handleSaveBooking = async () => {
        try {
            const currentUser = auth().currentUser;
            if (currentUser) {
                const { uid, displayName } = currentUser;

                await firestore().collection('Bill').add({
                    userId: uid,
                    name: displayName || creatorName,
                    serviceName,
                    prices,
                    imageUrl,
                    quantity,
                    totalPrice,
                    creatorName,
                    paymentMethod,
                });
                Alert.alert('Thông báo', 'Đặt hàng thành công');
                navigation.navigate('Trang chủ');
            } else {
                Alert.alert('Lỗi', 'Người dùng chưa đăng nhập');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể lưu đặt hàng');
        }
    };

    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' VND';
    };

    const handleCardPaymentSelection = () => {
        Alert.alert(
            'Chọn phương thức thanh toán',
            'Vui lòng chọn phương thức thanh toán',
            [
                {
                    text: 'VNPay',
                    onPress: handleVnPayPayment,
                },
                {
                    text: 'PayPal',
                    onPress: handlePayPalPayment,
                },
                {
                    text: 'Thẻ tín dụng',
                    onPress: handleCreditCardPayment,
                },
            ],
            { cancelable: true }
        );
    };

    const createPaymentUrl = async (totalPrice) => {
        const apiUrl = 'http://172.20.10.6:3000/create-payment';
        const requestData = {
            amount: totalPrice,
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error('Failed to create payment URL');
            }

            const responseData = await response.json();
            return responseData.paymentUrl;
        } catch (error) {
            console.error('Error occurred while creating payment URL:', error);
            Alert.alert('Lỗi', 'Không thể tạo URL thanh toán');
        }
    };

    const handleVnPayPayment = async () => {
        try {
            const paymentUrl = await createPaymentUrl(totalPrice);
            if (paymentUrl) {
                navigation.navigate('PaymentWebView', { url: paymentUrl });
            }
        } catch (error) {
            console.error('Error occurred while processing VNPay payment:', error);
            Alert.alert('Lỗi', 'Không thể thực hiện thanh toán VNPay');
        }
    };

    const handlePayPalPayment = () => {
        Alert.alert('PayPal', 'Chức năng thanh toán PayPal');
        // Handle PayPal payment logic here
    };

    const handleCreditCardPayment = () => {
        Alert.alert('Credit Card', 'Chức năng thanh toán bằng thẻ tín dụng');
        // Handle Credit Card payment logic here
    };

    const togglePaymentMethod = (method) => {
        if (method === 'card') {
            handleCardPaymentSelection();
        }
        setPaymentMethod(method);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Thanh toán</Text>
            </View>
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <Image source={{ uri: imageUrl }} style={styles.image} />
                    <View style={styles.textContainer}>
                        <Text style={styles.bookingText}>Tên sản phẩm: {serviceName}</Text>
                        <Text style={styles.bookingText}>Giá: {formatPrice(prices)}</Text>
                        <Text style={styles.bookingText}>Số lượng: {quantity}</Text>
                        <Text style={styles.bookingText}>Tổng tiền: {formatPrice(totalPrice)}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.paymentOptions}>
                <View style={styles.checkboxContainer}>
                    <TouchableOpacity onPress={() => togglePaymentMethod('cod')}>
                        <Icon name={paymentMethod === 'cod' ? "check-square-o" : "square-o"} size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.label}>Thanh toán khi nhận hàng</Text>
                </View>
                <View style={styles.checkboxContainer}>
                    <TouchableOpacity onPress={() => togglePaymentMethod('card')}>
                        <Icon name={paymentMethod === 'card' ? "check-square-o" : "square-o"} size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.label}>Thanh toán bằng thẻ</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity onPress={handleSaveBooking} style={styles.paymentButton}>
                    <Text style={styles.buttonText}>{paymentMethod === 'cod' ? 'Thanh toán' : 'Tiếp tục'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const Stack = createStackNavigator();

const Bill = ({ route }) => {
    return (
        <Stack.Navigator
            initialRouteName="Bill"
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Bill" component={BillVnpay} initialParams={route.params} />
            <Stack.Screen name="PaymentWebView" component={PaymentWebView} />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 15,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginHorizontal: 20,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        marginLeft: 20,
    },
    bookingText: {
        fontSize: 16,
        marginBottom: 5,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    paymentOptions: {
        marginHorizontal: 20,
        marginTop: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        marginLeft: 10,
        fontSize: 16,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 10,
        left: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        flexDirection: 'column',
        alignItems: 'center',
    },
    paymentButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#ffa500',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Bill;

