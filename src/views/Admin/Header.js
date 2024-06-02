import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'; // Import Firebase Authentication
import Icon from 'react-native-vector-icons/FontAwesome';

const Header = ({ navigation }) => {
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const currentUser = auth().currentUser; // Get the current user
                if (currentUser) {
                    const userDoc = await firestore().collection('user').doc(currentUser.uid).get();
                    if (userDoc.exists) {
                        const user = userDoc.data();
                        setUsername(user.name);
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <View style={styles.upperView}>
            <Text style={styles.username}>{username || 'Guest'}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
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

export default Header;
