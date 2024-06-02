import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createStackNavigator } from '@react-navigation/stack';
import Bill from './Bill';
import { addToCart } from './firestoreService';
import firestore from '@react-native-firebase/firestore';
import { AirbnbRating } from 'react-native-ratings';

const Stack = createStackNavigator();

const DetailsScreen = ({ route, navigation }) => {
    const { service } = route.params;
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState(null);
    const [cartQuantity, setCartQuantity] = useState(0);
    const [totalPrice, setTotalPrice] = useState(service.prices * quantity);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(0);

    useEffect(() => {
        const unsubscribe = firestore().collection('cart').onSnapshot(querySnapshot => {
            let totalQuantity = 0;
            querySnapshot.forEach(doc => {
                const item = doc.data();
                totalQuantity += item.quantity;
            });
            setCartQuantity(totalQuantity);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        setTotalPrice(service.prices * quantity);
    }, [quantity, selectedSize]);

    useEffect(() => {
        const unsubscribe = firestore()
            .collection('comments')
            .where('serviceId', '==', service.id) // Chỉ lấy comments của sản phẩm hiện tại
            .onSnapshot(snapshot => {
                const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setComments(fetchedComments);
            });

        return () => unsubscribe();
    }, [service.id]);

    const handleBooking = () => {
        if (!selectedSize) {
            Alert.alert('Please select a size.');
            return;
        }
        navigation.navigate('Bill', {
            serviceName: service.service,
            prices: service.prices,
            imageUrl: service.imageUrl,
            quantity: quantity,
            size: selectedSize,
        });
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            Alert.alert('Please select a size.');
            return;
        }

        const cartItem = {
            serviceName: service.service,
            price: totalPrice,
            imageUrl: service.imageUrl,
            quantity: quantity,
            size: selectedSize,
        };

        addToCart(cartItem)
            .then(() => {
                Alert.alert('Added to cart successfully!');
                navigation.navigate('Trang chủ'); // Điều hướng người dùng đến trang chủ sau khi thêm vào giỏ hàng
            })
            .catch((error) => Alert.alert('Error adding to cart: ', error));
    };

    const handleAddComment = () => {
        if (newComment.trim() === '') {
            Alert.alert('Comment cannot be empty.');
            return;
        }

        const commentData = {
            serviceId: service.id, // Đảm bảo serviceId không bị undefined
            serviceName: service.service,
            text: newComment,
            rating: rating,
            timestamp: firestore.FieldValue.serverTimestamp(),
        };

        firestore()
            .collection('comments')
            .add(commentData)
            .then(() => {
                setNewComment('');
                setRating(0);
                Alert.alert('Comment added successfully!');
            })
            .catch((error) => {
                Alert.alert('Error adding comment: ', error);
            });
    };

    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' VND';
    };

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: service.imageUrl }} style={styles.image} />
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
                    <Icon name="shopping-cart" size={30} color="black" />
                    {cartQuantity > 0 && <Text style={styles.cartQuantity}>{cartQuantity}</Text>}
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.container}>
                <View style={styles.containerWrapper}>
                    <View>
                        <Text style={styles.productNameText}>{service.service}</Text>
                        <Text style={styles.priceText}>{formatPrice(service.prices)}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.label}>Kích thước:</Text>
                        <View style={styles.sizeContainer}>
                            {['S', 'M', 'L', 'XL'].map(size => (
                                <TouchableOpacity
                                    key={size}
                                    style={[styles.sizeOption, selectedSize === size && styles.selectedSizeOption]}
                                    onPress={() => setSelectedSize(size)}
                                >
                                    <Text style={styles.sizeText}>{size}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.label}>Số lượng:</Text>
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.quantityButton}>
                                <Icon name="minus-circle" size={30} color="black" />
                            </TouchableOpacity>
                            <View style={styles.quantityBox}>
                                <Text style={styles.quantityText}>{quantity}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.quantityButton}>
                                <Icon name="plus-circle" size={30} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ marginLeft: 10 }}>
                        <Text style={styles.label}>Mô tả:</Text>
                        <View>
                            <Text style={{ fontSize: 15 }}>{service.description}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.commentSection}>
                    <Text style={styles.commentTitle}>Đánh giá</Text>
                    <FlatList
                        data={comments}
                        renderItem={({ item }) => (
                            <View style={styles.comment}>
                                <Text style={styles.commentText}>Rating: {item.rating}</Text>
                                <Text style={styles.commentText}>{item.text}</Text>
                                <Text style={styles.commentTimestamp}>{new Date(item.timestamp?.toDate()).toLocaleString()}</Text>
                            </View>
                        )}
                        keyExtractor={(item) => item.id}
                    />
                    <View style={styles.commentInputContainer}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Thêm đánh giá"
                            value={newComment}
                            onChangeText={setNewComment}
                        />
                        <TouchableOpacity style={styles.commentButton} onPress={handleAddComment}>
                            <Text style={styles.commentButtonText}>Gửi</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.ratingContainer}>
                        <Text style={styles.label}>Đánh giá của bạn:</Text>
                        <AirbnbRating
                            count={5}
                            defaultRating={0}
                            size={20}
                            showRating={false}
                            onFinishRating={setRating}
                        />
                    </View>
                </View>
            </ScrollView>
            <View style={styles.footer}>
                <TouchableOpacity style={styles.footerButton1} onPress={handleBooking}>
                    <Icon name="money" size={20} color="white" />
                    <Text style={styles.buttonText}>Mua ngay</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerButton} onPress={handleAddToCart}>
                    <Icon name="shopping-cart" size={20} color="white" />
                    <Text style={styles.buttonText}>Thêm vào giỏ hàng</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const Details = ({ route }) => {
    return (
        <Stack.Navigator
            initialRouteName="Details"
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Details" component={DetailsScreen} initialParams={route.params} />
            <Stack.Screen name="Bill" component={Bill} options={{ title: 'Booking' }} />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
    },
    backButton: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartQuantity: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 20,
        height: 20,
        textAlign: 'center',
        color: 'white',
        fontSize: 14,
    },
    containerWrapper: {
        padding: 10,
    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginLeft: 10,
    },
    inputContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 5,
        padding: 5,
    },
    priceText: {
        padding: 10,
        fontSize: 24,
        color: 'black',
        fontWeight: 'bold',
    },
    productNameText: {
        padding: 10,
        fontSize: 20,
        color: 'black',
        fontWeight: 'bold',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        position: 'absolute',
        bottom: 0,
        left: 10,
        right: 10,
        backgroundColor: 'white',
        paddingBottom: 10,
    },
    footerButton: {
        backgroundColor: '#ffa500',
        borderRadius: 10,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 10,
        marginLeft: 10,
    },
    footerButton1: {
        backgroundColor: '#ffa500',
        borderRadius: 10,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    totalPriceText: {
        color: '#000080',
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        padding: 10,
    },
    quantityBox: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        marginHorizontal: 10,
    },
    quantityText: {
        fontSize: 20,
    },
    sizeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 10,
    },
    sizeOption: {
        padding: 10,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        marginLeft: 5,
    },
    selectedSizeOption: {
        backgroundColor: '#ffa500',
    },
    sizeText: {
        fontSize: 16,
        color: 'black',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
    },
    commentSection: {
        marginTop: 20,
        padding: 10,
    },
    commentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    comment: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    commentText: {
        fontSize: 16,
    },
    commentTimestamp: {
        fontSize: 12,
        color: '#888',
        marginTop: 5,
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
    },
    ratingContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    commentButton: {
        backgroundColor: '#ffa500',
        borderRadius: 5,
        padding: 10,
    },
    commentButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default Details;
