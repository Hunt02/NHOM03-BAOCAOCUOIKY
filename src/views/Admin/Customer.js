import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ScrollView, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';

import Header from './Header';

const Customer = () => {
    const [groupedBookings, setGroupedBookings] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredBookings, setFilteredBookings] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const snapshot = await firestore().collection('Bill').get();
                const bookingsData = snapshot.docs.map(doc => doc.data());

                // Group bookings by creatorName
                const groupedData = bookingsData.reduce((groups, booking) => {
                    const { creatorName, totalPrice } = booking;
                    if (!groups[creatorName]) {
                        groups[creatorName] = { bookings: [], totalAmount: 0 };
                    }
                    groups[creatorName].bookings.push(booking);
                    groups[creatorName].totalAmount += totalPrice;
                    return groups;
                }, {});

                // Convert the grouped data into an array
                const groupedArray = Object.keys(groupedData).map(creatorName => ({
                    creatorName,
                    bookings: groupedData[creatorName].bookings,
                    totalAmount: groupedData[creatorName].totalAmount,
                }));

                setGroupedBookings(groupedArray);
                setFilteredBookings(groupedArray);
            } catch (error) {
                console.error('Error fetching bookings: ', error);
            }
        };

        fetchBookings();
    }, []);

    useEffect(() => {
        if (searchText) {
            const filteredData = groupedBookings.filter(group =>
                group.creatorName.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredBookings(filteredData);
        } else {
            setFilteredBookings(groupedBookings);
        }
    }, [searchText, groupedBookings]);
    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' VND';
    };


    return (
        <View style={styles.container}>
            <Header />
            <TextInput
                style={styles.searchBar}
                placeholder="Tìm kiếm theo tên người đặt"
                value={searchText}
                onChangeText={text => setSearchText(text)}
            />
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.list}>
                    <Text style={styles.title}>CÁC ĐƠN HÀNG</Text>
                    <FlatList
                        data={filteredBookings}
                        renderItem={({ item }) => (
                            <View style={styles.groupCard}>
                                <Text style={styles.groupTitle}>{item.creatorName}</Text>
                                {item.bookings.map((booking, index) => (
                                    <View key={index} style={styles.card}>
                                        <Text style={styles.serialNumber}>{index + 1}.</Text>
                                        <View style={styles.itemContent}>
                                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                                <Image source={{ uri: booking.imageUrl }} style={styles.image} />
                                            </View>
                                            <View style={{ marginLeft: 15 }}>
                                                <Text style={styles.bookingText}>Tên sản phẩm: {booking.serviceName}</Text>
                                                <Text style={styles.bookingText}>Giá: {formatPrice(booking.prices)}</Text>
                                                <Text style={styles.bookingText}>Số lượng: {booking.quantity}</Text>
                                                <Text style={styles.bookingText}>Tổng tiền: {formatPrice(booking.totalPrice)} VND</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                                <Text style={styles.totalAmountText}>Tổng tiền: {formatPrice(item.totalAmount)}</Text>
                            </View>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    searchBar: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        margin: 10,
        paddingHorizontal: 10,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    list: {
        padding: 20,
    },
    groupCard: {
        marginBottom: 20,
    },
    groupTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    totalAmountText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'right',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    serialNumber: {
        marginRight: 10,
        fontWeight: 'bold',
    },
    itemContent: {
        flexDirection: 'row',
        flex: 1,
    },
    bookingText: {
        fontSize: 16,
        marginBottom: 5,
    },
    image: {
        width: 80,
        height: 80,
        marginBottom: 10,
        borderRadius: 10,
    },
});

export default Customer;
