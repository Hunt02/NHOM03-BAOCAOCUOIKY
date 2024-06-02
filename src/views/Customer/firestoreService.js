
import firestore from '@react-native-firebase/firestore';

const addToCart = async (item) => {
    try {
        await firestore().collection('cart').add(item);
        console.log('Added to cart: ', item);
    } catch (error) {
        console.error('Error adding to cart: ', error);
    }
};

export { addToCart };
