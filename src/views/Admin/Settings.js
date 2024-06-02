import React from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createStackNavigator } from '@react-navigation/stack';
import UserList from './UserList';

const Stack = createStackNavigator();

const SettingsScreen = ({ navigation }) => {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Cài đặt</Text>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.text}>Common</Text>
                </View>
                <View style={styles.sectionItem}>
                    <Icon name='globe' style={styles.icon} size={20} color={'black'} />
                    <Text style={styles.text}>Ngôn ngữ</Text>
                    <View style={{ flex: 1 }} />
                    <Text style={styles.text}>English</Text>
                    <Icon name='chevron-right' style={styles.chevron} size={20} color={'black'} />
                </View>
                <View style={styles.sectionItem}>
                    <Icon name='cloud' style={styles.icon} size={16} color={'black'} />
                    <Text style={styles.text}>Môi trường </Text>
                    <View style={{ flex: 1 }} />
                    <Text style={styles.text}>Production</Text>
                    <Icon name='chevron-right' style={styles.chevron} size={20} color={'black'} />
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.text}>Account</Text>
                </View>
                <TouchableOpacity
                    style={styles.sectionItem}
                    onPress={() => navigation.navigate('UserList')}
                >
                    <Icon name='phone' style={styles.icon} size={16} color={'black'} />
                    <Text style={styles.text}>Danh sách tài khoản</Text>
                    <View style={{ flex: 1 }} />
                    <Icon name='chevron-right' style={styles.chevron} size={20} color={'black'} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('Login')}>
                    <Icon name='sign-out' style={styles.icon} size={20} color={'black'} />
                    <Text style={styles.text}>Đăng xuất</Text>
                    <View style={{ flex: 1 }} />
                    <Icon name='chevron-right' style={styles.chevron} size={20} color={'black'} />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.text}>Security</Text>
                </View>

                <View style={styles.sectionItem}>
                    <Icon name='lock' style={styles.icon} size={20} color={'black'} />
                    <Text style={styles.text}>Change password</Text>
                    <View style={{ flex: 1 }} />
                </View>
            </View>
        </ScrollView>
    );
};

const Settings = ({ route }) => {
    return (
        <Stack.Navigator
            initialRouteName="SettingsScreen"
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SettingsScreen" component={SettingsScreen} initialParams={route.params} />
            <Stack.Screen name="UserList" component={UserList} options={{ title: 'User List' }} />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 15,
        flex: 1,
        padding: 15,
        backgroundColor: 'white'
    },
    title: {
        color: 'black',
        fontSize: 30,
        marginBottom: 10,
    },
    section: {
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        overflow: 'hidden'
    },
    sectionHeader: {
        height: 40,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    sectionItem: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    text: {
        color: 'black',
        fontSize: 20,
        paddingStart: 10
    },
    icon: {
        marginStart: 10,
    },
    chevron: {
        paddingEnd: 10,
        opacity: 0.5,
    }
});

export default Settings;
