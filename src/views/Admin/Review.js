import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const Transaction = () => {
    const [comments, setComments] = useState([]);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const snapshot = await firestore().collection('comments').get();
                const commentsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setComments(commentsData);
            } catch (error) {
                console.error('Error fetching comments: ', error);
            }
        };

        fetchComments();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đánh giá của khách hàng</Text>
            <FlatList
                data={comments}
                renderItem={({ item }) => (
                    <View style={styles.commentCard}>
                        <Text style={styles.commentServiceId}>Sản phẩm: {item.serviceName}</Text>
                        <Text style={styles.commentAuthor}>Nhận xét: {item.text}</Text>
                        <Text style={styles.commentRating}>Đánh giá: {item.rating}</Text>

                    </View>
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: 'black',
    },
    list: {
        flexGrow: 1,
    },
    commentCard: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    commentAuthor: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    commentText: {
        fontSize: 16,
        marginBottom: 5,
    },
    commentRating: {
        fontSize: 16,
        fontStyle: 'italic',
        marginBottom: 5,
    },
    commentServiceId: {
        fontSize: 16,
    },
});

export default Transaction;
