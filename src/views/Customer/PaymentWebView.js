import React from 'react';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';

const PaymentWebView = ({ route }) => {
    const { url } = route.params;
    const navigation = useNavigation();

    const handleNavigationStateChange = (navState) => {
        const { url } = navState;
        // Thay đổi điều kiện dưới đây dựa trên URL xác nhận thanh toán thành công của bạn
        if (url.includes('success')) {
            navigation.navigate('Trang chủ');
        }
    };

    return (
        <WebView
            source={{ uri: url }}
            style={{ flex: 1 }}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onNavigationStateChange={handleNavigationStateChange}
        />
    );
};

export default PaymentWebView;
