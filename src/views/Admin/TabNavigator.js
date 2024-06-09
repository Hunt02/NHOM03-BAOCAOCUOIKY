import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './Home';
import Review from './Review';
import Order from './Order';
import SettingsScreen from './Settings';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Text } from 'react-native';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = ({ navigation, route }) => {
    const userName = route.params?.userName || "Default Name";

    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen
                name={"Home"}
                component={HomeStackScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="home" color={color} size={size} />
                    ),

                }}
            />
            <Tab.Screen
                name="Review"
                component={Review}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="commenting" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Order"
                component={CustomerStackScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="shopping-cart" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsStackScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="cog" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const HomeStackScreen = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
);

const TransactionStackScreen = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Review" component={Review} />
    </Stack.Navigator>
);

const CustomerStackScreen = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Order" component={Order} />
    </Stack.Navigator>
);

const SettingsStackScreen = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
);

export default TabNavigator;
