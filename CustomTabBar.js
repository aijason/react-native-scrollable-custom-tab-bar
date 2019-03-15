import React, { PureComponent } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Animated,
    TouchableNativeFeedback,
    TouchableOpacity,
    Platform
} from 'react-native';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabs: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderWidth: 1,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderColor: '#f4f4f4',
    },
});

const propTypes = {
    activeColor: PropTypes.string,        // Tab选中时的颜色
    inactiveColor: PropTypes.string,      // Tab未选中时的颜色
    tabUnderlineScaleX: PropTypes.number, // Tab底部下划线横向切换时的缩放倍数
    tabUnderlineWidth: PropTypes.number,  // Tab底部下划线宽度
    underlineStyle: PropTypes.object,
    backgroundColor: PropTypes.string,    // Tab背景颜色
};

const defaultProps = {
    activeColor: '#be844c',
    inactiveColor: '#222222',
    tabUnderlineScaleX: 3,
    tabUnderlineWidth: 30,
    underlineStyle: {},
    backgroundColor: '#fffff'
};

const ButtonAndroid = props => (
    <TouchableNativeFeedback
        delayPressIn={0}
        background={TouchableNativeFeedback.SelectableBackground()}
        {...props}
    >
        {props.children}
    </TouchableNativeFeedback>);

const ButtonIOS = props => (
    <TouchableOpacity {...props}>
        {props.children}
    </TouchableOpacity>);

/**
 * 自定义TabBar
 * */
class CustomTabBar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
        this.handleInterpolateObj = this.handleInterpolateObj.bind(this);
    }

    // 处理返回插值对象
    handleInterpolateObj(defaultScale) {
        const numberOfTabs = this.props.tabs.length;
        const arr = new Array(numberOfTabs * 2);
        return arr.fill(0).reduce((pre, cur, idx) => {
            pre.inputRange.push(idx === 0 ? cur : pre.inputRange[idx - 1] + 0.5);
            pre.outputRange.push(idx % 2 ? defaultScale : 1);
            return pre;
        }, { inputRange: [], outputRange: [] });
    }

    renderTab(name, page, isTabActive, onPressHandler) {
        const { activeColor, inactiveColor } = this.props;
        // 文本颜色
        const textColor = isTabActive ? activeColor : inactiveColor;
        // 字体粗细
        const fontWeight = isTabActive ? 'bold' : 'normal';
        // 按钮类型区分平台
        const Button = Platform.OS === 'ios' ? ButtonIOS : ButtonAndroid;

        return (
            <Button
                style={{ flex: 1 }}
                key={name}
                accessible={true}
                accessibilityLabel={name}
                accessibilityTraits="button"
                onPress={() => onPressHandler(page)}
            >
                <View style={styles.tab}>
                    <Text style={[{ color: textColor, fontWeight }]}>
                        {name}
                    </Text>
                </View>
            </Button>
        );
    }

    renderUnderline() {
        const { containerWidth, tabUnderlineScaleX, tabUnderlineWidth, underlineStyle } = this.props;
        // tabs数量
        const numberOfTabs = this.props.tabs.length;
        // 下划线宽度
        const underlineWidth = tabUnderlineWidth || containerWidth / (numberOfTabs * 2);
        // 下划线缩放倍数
        const scale = tabUnderlineScaleX;
        // 下划线距离左边长度
        const deLen = (containerWidth / numberOfTabs - underlineWidth) / 2;

        // tab下划线样式
        const tabUnderlineStyle = {
            position: 'absolute',
            width: underlineWidth,
            height: 4,
            borderRadius: 2,
            backgroundColor: this.props.activeColor,
            bottom: 0,
            left: deLen
        };
        // 下划线每次横向移动的偏移量（一个tab的宽度）
        const translateX = this.props.scrollValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, containerWidth / numberOfTabs],
        });
        // 动画插值对象
        const interpolateObj = this.handleInterpolateObj(scale);
        // 切换下划线动态缩放差值
        const scaleX = this.props.scrollValue.interpolate(interpolateObj);

        return (
            <Animated.View
                style={[tabUnderlineStyle,
                    {transform: [{ translateX },{ scaleX }]},
                    underlineStyle]}
            />
        );
    }

    render() {
        /**
         * 下面三个属性props由renderTabBar传入
         * tabs: tab标题数组数据
         * activeTab: 选中tab的索引值
         * goToPage: 跳转函数
         * */
        const { tabs, activeTab, goToPage, backgroundColor, style } = this.props;
        return (
            <View style={[styles.tabs, { backgroundColor }, style]}>
                {
                    tabs.map((name, page) => {
                        const isTabActive = activeTab === page;
                        return this.renderTab(name, page, isTabActive, goToPage);
                    })
                }
                {this.renderUnderline()}
            </View>
        );
    }
}

CustomTabBar.propTypes = propTypes;
CustomTabBar.defaultProps = defaultProps;

export default CustomTabBar;
