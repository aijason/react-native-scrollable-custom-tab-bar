import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import CustomTabBar from "./CustomTabBar";
// import ScrollableTabBar from "./ScrollableTabBar";

export default class App extends Component {
    render() {
        return (
            <View style={{flex: 1, paddingTop: 100}}>
                <ScrollableTabView
                    renderTabBar={() => <CustomTabBar/>}
                    // renderTabBar={() => <ScrollableTabBar/>}
                >
                    <View style={styles.container} tabLabel="全部">
                        <Text style={styles.welcome}>全部</Text>
                    </View>
                    <View style={styles.container} tabLabel="卫浴">
                        <Text style={styles.welcome}>卫浴</Text>
                    </View>
                    <View style={styles.container} tabLabel="毛巾">
                        <Text style={styles.welcome}>毛巾</Text>
                    </View>
                </ScrollableTabView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    }
});
