const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const qs = require('qs');

const app = express();
const port = process.env.PORT || 3000;
const ipAddress = '172.20.10.6'; // Update this to your server's IP address

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const vnp_TmnCode = 'NDBFQGG9'; // Your VNPay TMN code
const vnp_HashSecret = '54C0HBW5OEJK6FL5VN8DIS68G569PKU1'; // Your VNPay hash secret
const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'; // VNPay API URL
const vnp_ReturnUrl = `http://${ipAddress}:${port}/vnpay_return`; // Your return URL

app.post('/create-payment', (req, res) => {
    const { amount } = req.body;
    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const tmnCode = vnp_TmnCode;
    const secretKey = vnp_HashSecret;
    const vnpUrl = vnp_Url;
    const returnUrl = vnp_ReturnUrl;

    const date = new Date();
    const createDate = date.toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const orderId = createDate + Math.floor(Math.random() * 1000000);

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100; // VNPay requires amount in VND, so multiply by 100
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    const paymentUrl = vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false });
    res.json({ paymentUrl });
});

function sortObject(obj) {
    const sorted = {};
    Object.keys(obj)
        .sort()
        .forEach((key) => {
            if (key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
                sorted[key] = obj[key];
            }
        });
    return sorted;
}

app.listen(port, ipAddress, () => {
    console.log(`VNPay API server is running on http://${ipAddress}:${port}`);
});
