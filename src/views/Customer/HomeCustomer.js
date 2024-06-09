import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, FlatList } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileCustomer from './ProfileCustomer';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import Details from './Details';
import HeaderCustomer from './HeaderCustomer';
import Cart from './Cart'
const Stack = createStackNavigator();

const HomeScreenCustomer = ({ navigation }) => {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [username, setUsername] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [cartQuantity, setCartQuantity] = useState(0);
    const images = [
        require('../../image/banner1.jpeg'),
        require('../../image/banner2.jpeg'),
        require('../../image/banner3.jpeg'),
        require('../../image/hinh1.jpeg'),
        require('../../image/hinh2.jpeg'),
        require('../../image/hinh3.jpeg'),
    ];
    useEffect(() => {
        const timer = setTimeout(() => {
            // Tăng chỉ số hình ảnh hiện tại, quay lại 0 nếu vượt quá số lượng hình ảnh
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000); // 5 giây

        // Xóa timer khi component unmount
        return () => clearTimeout(timer);
    }, [currentImageIndex]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const servicesSnapshot = await firestore().collection('services').get();
                const servicesData = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setServices(servicesData);
                setFilteredServices(servicesData);
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };

        const fetchUserData = async () => {
            try {
                const userQuerySnapshot = await firestore().collection('user').get();
                userQuerySnapshot.forEach(doc => {
                    const user = doc.data();
                    setUsername(user.user);
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchServices();
        fetchUserData();

        const unsubscribe = navigation.addListener('focus', () => {
            fetchServices();
            fetchUserData();
        });

        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        if (searchQuery) {
            const filtered = services.filter(service =>
                service.service.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredServices(filtered);
        } else {
            setFilteredServices(services);
        }
    }, [searchQuery, services]);

    const handleServicePress = (service) => {
        navigation.navigate('Details', { service });
    };

    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' VND';
    };

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
    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => handleServicePress(item)}>
            <View style={styles.itemContainer}>
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
                <Text style={styles.itemText}>Tên sản phẩm: {item.service}</Text>
                <Text style={styles.itemText}>Giá: {formatPrice(item.prices)}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* <HeaderCustomer navigation={navigation} /> */}

            <View style={{ flexDirection: 'row' }}>

                <TextInput
                    style={styles.searchBar}
                    placeholder="Tìm kiếm ..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />

                <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
                    <Icon name="shopping-cart" size={30} color="black" />
                    {cartQuantity > 0 && <Text style={styles.cartQuantity}>{cartQuantity}</Text>}
                </TouchableOpacity>

            </View>
            <View style={{ padding: 10 }}>
                <Image source={images[currentImageIndex]} style={styles.image1} />
            </View>


            <View style={styles.contentContainer}>
                <FlatList
                    data={filteredServices}
                    renderItem={renderItem}
                    keyExtractor={item => String(item.id)}
                    style={styles.list}
                    numColumns={2}
                    contentContainerStyle={styles.list}
                />
            </View>
        </View>
    );
};

const HomeCustomer = ({ route }) => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="Trang chủ"
                component={HomeScreenCustomer}
                initialParams={route.params}
            />
            {/* <Stack.Screen name="ProfileCustomer" component={ProfileCustomer} /> */}
            <Stack.Screen name="Details" component={Details} />
            <Stack.Screen name="Cart" component={Cart} />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    searchBar: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 30,
        margin: 10,
        paddingLeft: 10,
        width: 330,
        flexDirection: 'row'
    },
    cartButton: {
        marginTop: 10,
        marginLeft: 10,
        position: 'relative',
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
    contentContainer: {
        flex: 1,
        padding: 10,
    },
    list: {
        flexDirection: 'column',
    },
    card: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flex: 1,
        margin: 5,
        height: 250
    },
    itemContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 10,
        marginBottom: 10,
    },
    image1: {
        width: "100%",
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
        padding: 10
    },
    itemText: {
        fontSize: 16,
        marginRight: 'auto',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerText: {
        flex: 1,
        fontSize: 30,
        textAlign: 'center',
        color: 'black',
    },
    deleteButton: {
        marginTop: 15,
        marginLeft: 10
    },
});

export default HomeCustomer;
