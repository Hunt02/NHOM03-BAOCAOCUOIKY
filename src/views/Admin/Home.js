import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import AddNewServices from './AddNewServices';
import ServiceDetails from './ServiceDetails';
import Profile from './Profile';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from './Header';

const Stack = createStackNavigator();

const HomeScreen = ({ navigation }) => {
    const [services, setServices] = useState([]);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const servicesSnapshot = await firestore().collection('services').get();
                const servicesData = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setServices(servicesData);
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };

        const fetchUserData = async () => {
            try {
                const userQuerySnapshot = await firestore().collection('user').get();
                userQuerySnapshot.forEach(doc => {
                    const user = doc.data();
                    setUsername(user.name);
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

    const handleServicePress = (service) => {
        navigation.navigate('ServiceDetails', { service });
    };

    const formatPrice = (price) => {
        const priceNumber = Number(price);
        return priceNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' VND';
    };

    const renderItem = ({ item, index }) => (
        <TouchableOpacity style={styles.card} onPress={() => handleServicePress(item)}>
            <View style={styles.itemContainer}>
                <Text style={styles.itemText}>{`${index + 1}. ${item.service}`}</Text>
                <Text style={styles.itemText}>{formatPrice(item.prices)}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header navigation={navigation} />
            <View style={styles.contentContainer}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../image/LOGO.png')}
                        style={{ width: 200, height: 200 }}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.header}>
                    <Text style={styles.headerText}>DANH SÁCH DỊCH VỤ</Text>
                    <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddNewServices')}>
                        <Text style={styles.buttonText}>+</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={services}
                    renderItem={renderItem}
                    keyExtractor={item => String(item.id)}
                    style={styles.list}
                />
            </View>
        </View>
    );
};

const Home = ({ route }) => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                initialParams={route.params}
            />

            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="AddNewServices" component={AddNewServices} />
            <Stack.Screen name="ServiceDetails" component={ServiceDetails} />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contentContainer: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: '#f5f5f5s',
        borderRadius: 30,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        color: 'black',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        color: 'black',
    },
    itemText: {
        fontSize: 16,
        color: 'black',
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20,
        color: 'black',
    },
    headerText: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    addButton: {
        backgroundColor: 'black',
        borderRadius: 50,
        width: 35,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    buttonText: {
        fontSize: 20,
        color: 'white',
    },
    list: {
        marginTop: 20,
        color: 'black',
    },
});

export default Home;
