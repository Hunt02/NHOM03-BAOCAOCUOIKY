import React from 'react';
import { WebView } from 'react-native-webview';
import qs from 'qs';
import CryptoJS from 'crypto-js';

const PaymentWebView = () => {
    // Các thông tin cần thiết cho yêu cầu thanh toán
    const vnpUrl = 'http://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: 'NDBFQGG9',
        vnp_Amount: '10000000', // Số tiền thanh toán
        vnp_CurrCode: 'VND',
        vnp_TxnRef: '20240530123456', // Mã giao dịch
        vnp_OrderInfo: 'Thanh toán đơn hàng #20240530123456', // Thông tin đơn hàng
        vnp_ReturnUrl: 'http://localhost:3000/vnpay_return', // URL trả về sau khi thanh toán thành công
    };

    // Tạo chữ ký (SecureHash)
    const secretKey = '54C0HBW5OEJK6FL5VN8DIS68G569PKU1'; // Khóa bí mật của bạn
    const secureHash = CryptoJS.HmacSHA512(qs.stringify(vnp_Params, { encode: false }), secretKey).toString(CryptoJS.enc.Hex);

    // Kết hợp chữ ký vào thông tin yêu cầu thanh toán
    const paymentUrl = vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false }) + '&vnp_SecureHash=' + secureHash;

    return (
        <WebView
            source={{ uri: paymentUrl }}
            style={{ marginTop: 20 }}
        />
    );
};

export default PaymentWebView;
