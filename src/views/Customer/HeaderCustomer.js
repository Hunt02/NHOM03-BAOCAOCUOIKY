import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';

const HeaderCustomer = ({ navigation }) => {
    const [username, setUsername] = useState('');

    useEffect(() => {
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

        fetchUserData();
    }, []);

    return (
        <View style={styles.upperView}>
            <Text style={styles.username}>{username || 'Guest'}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileCustomer')}>
                <View style={styles.iconContainer}>
                    <Icon name="user" size={25} color="black" />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    upperView: {
        width: '100%',
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
    },
    username: {
        marginRight: 'auto',
        marginLeft: 10,
        fontSize: 18,
        fontWeight: 'bold',
    },
    iconContainer: {
        padding: 5,
    },
});

export default HeaderCustomer;
