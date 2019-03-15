import React, { PureComponent } from 'react';
import {
  ViewPropTypes,
  View,
  Animated,
  ScrollView,
  Text,
  Platform,
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';
import styles from './ScrollableTabBar.style';

const Button = require('react-native-scrollable-tab-view/Button');

const WINDOW_WIDTH = Dimensions.get('window').width;

const propTypes = {
  goToPage: PropTypes.func,                // 跳转函数
  activeTab: PropTypes.number,             // 选中tab的索引值
  tabs: PropTypes.array,                   // Tab标题数组数据
  backgroundColor: PropTypes.string,       // Tab背景颜色
  activeTextColor: PropTypes.string,       // Tab选中时的文本颜色
  inactiveTextColor: PropTypes.string,     // Tab未选中时的文本颜色
  style: ViewPropTypes.style,              // 总容器样式
  tabStyle: ViewPropTypes.style,           // 单个Tab的样式
  tabsContainerStyle: ViewPropTypes.style, // Tab容器样式
  textStyle: Text.propTypes.style,         // Tab标题样式
  underlineStyle: ViewPropTypes.style,     // 下划线样式
  underlineWidth: PropTypes.number,        // 下划线宽度 （自定义）
};

const defaultProps = {
  goToPage: () => {},
  activeTab: 0,
  tabs: [],
  activeTextColor: '#be844c',
  inactiveTextColor: '#222222',
  backgroundColor: '#ffffff',
  style: {},
  tabStyle: {},
  tabsContainerStyle: {},
  underlineStyle: {},
  textStyle: {},
  underlineWidth: 20
};

class ScrollableTabBar extends PureComponent {

  constructor(props) {
    super(props);
    this.tabsMeasurements = [];
    this.state = {
      leftTabUnderline: new Animated.Value(0),
      widthTabUnderline: new Animated.Value(0),
      containerWidth: null,
    };
    this.onTabContainerLayout = this.onTabContainerLayout.bind(this);
    this.onContainerLayout = this.onContainerLayout.bind(this);
    this.updateView = this.updateView.bind(this);
    this.necessarilyMeasurementsCompleted = this.necessarilyMeasurementsCompleted.bind(this);
    this.updateTabPanel = this.updateTabPanel.bind(this);
    this.updateTabUnderline = this.updateTabUnderline.bind(this);
    this.renderTab = this.renderTab.bind(this);
    this.measureTab = this.measureTab.bind(this);
  }

  componentDidMount() {
    // eslint-disable-next-line
    this.props.scrollValue.addListener(this.updateView);
  }

  componentWillReceiveProps(nextProps) {
    // 如果选项卡发生更改，则强制重新计算选项卡容器的宽度
    if (JSON.stringify(this.props.tabs) !== JSON.stringify(nextProps.tabs)
        && this.state.containerWidth) {
      this.setState({ containerWidth: null });
    }
  }

  onTabContainerLayout(e) {
    this.tabContainerMeasurements = e.nativeEvent.layout;
    let width = this.tabContainerMeasurements.width;
    if (width < WINDOW_WIDTH) {
      width = WINDOW_WIDTH;
    }
    this.setState({ containerWidth: width, });
    this.updateView({ value: this.props.scrollValue.__getValue() });
  }

  onContainerLayout(e) {
    this.containerMeasurements = e.nativeEvent.layout;
    this.updateView({ value: this.props.scrollValue.__getValue() });
  }

  updateView(offset) {
    const position = Math.floor(offset.value);
    const pageOffset = offset.value % 1;
    const tabCount = this.props.tabs.length;
    const lastTabPosition = tabCount - 1;

    if (tabCount === 0 || offset.value < 0 || offset.value > lastTabPosition) {
      return;
    }

    if (this.necessarilyMeasurementsCompleted(position, position === lastTabPosition)) {
      this.updateTabPanel(position, pageOffset);
      this.updateTabUnderline(position, pageOffset, tabCount);
    }
  }

  necessarilyMeasurementsCompleted(position, isLastTab) {
    return this.tabsMeasurements[position] &&
      (isLastTab || this.tabsMeasurements[position + 1]) &&
      this.tabContainerMeasurements &&
      this.containerMeasurements;
  }

  updateTabPanel(position, pageOffset) {
    const containerWidth = this.containerMeasurements.width;
    const tabWidth = this.tabsMeasurements[position].width;
    const nextTabMeasurements = this.tabsMeasurements[position + 1];
    const nextTabWidth = (nextTabMeasurements && nextTabMeasurements.width) || 0;
    const tabOffset = this.tabsMeasurements[position].left;
    const absolutePageOffset = pageOffset * tabWidth;
    let newScrollX = tabOffset + absolutePageOffset;

    // center tab and smooth tab change (for when tabWidth changes a lot between two tabs)
    newScrollX -=
      (containerWidth - ((1 - pageOffset) * tabWidth) - (pageOffset * nextTabWidth)) / 2;
    newScrollX = newScrollX >= 0 ? newScrollX : 0;

    if (Platform.OS === 'android') {
      this.scrollView.scrollTo({ x: newScrollX, y: 0, animated: false, });
    } else {
      const rightBoundScroll =
        this.tabContainerMeasurements.width - (this.containerMeasurements.width);
      newScrollX = newScrollX > rightBoundScroll ? rightBoundScroll : newScrollX;
      this.scrollView.scrollTo({ x: newScrollX, y: 0, animated: false, });
    }
  }

  updateTabUnderline(position, pageOffset, tabCount) {
    const lineLeft = this.tabsMeasurements[position].left;
    const lineRight = this.tabsMeasurements[position].right;
    const underlineWidth = this.props.underlineWidth;

    if (position < tabCount - 1) {
      const nextTabLeft = this.tabsMeasurements[position + 1].left;
      const nextTabRight = this.tabsMeasurements[position + 1].right;

      const newLineLeft =
        (pageOffset * nextTabLeft) + ((1 - pageOffset) * lineLeft);
      const newLineRight =
        (pageOffset * nextTabRight) + ((1 - pageOffset) * lineRight);
      const offset =
        (newLineRight - newLineLeft - underlineWidth) / 2;

      this.state.leftTabUnderline.setValue(newLineLeft + offset);
      this.state.widthTabUnderline.setValue(underlineWidth);
    } else {
      const offset = (lineRight - lineLeft - underlineWidth) / 2;
      this.state.leftTabUnderline.setValue(lineLeft + offset);
      this.state.widthTabUnderline.setValue(underlineWidth);
    }
  }

  renderTab(name, page, isTabActive, onPressHandler, onLayoutHandler) {
    const { activeTextColor, inactiveTextColor, textStyle, } = this.props;
    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    const fontWeight = isTabActive ? 'bold' : 'normal';

    return (<Button
      key={`${name}_${page}`}
      accessible={true}
      accessibilityLabel={name}
      accessibilityTraits="button"
      onPress={() => onPressHandler(page)}
      onLayout={onLayoutHandler}
    >
      <View style={[styles.tab, this.props.tabStyle]}>
        <Text style={[{ color: textColor, fontWeight, }, textStyle]}>
          {name}
        </Text>
      </View>
    </Button>);
  }

  measureTab(page, event) {
    const { x, width, height, } = event.nativeEvent.layout;
    this.tabsMeasurements[page] = { left: x, right: x + width, width, height, };
    // eslint-disable-next-line
    this.updateView({ value: this.props.scrollValue.__getValue(), });
  }

  render() {
    /**
     * 下面三个属性props由renderTabBar传入
     * tabs: tab标题数组数据
     * activeTab: 选中tab的索引值
     * goToPage: 跳转函数
     * */
    const { tabs, activeTab, goToPage, backgroundColor } = this.props;

    const tabUnderlineStyle = {
      position: 'absolute',
      height: 4,
      backgroundColor: '#be844c',
      borderRadius: 2,
      bottom: 0,
    };

    const dynamicTabUnderline = {
      left: this.state.leftTabUnderline,
      width: this.state.widthTabUnderline,
    };

    return (<View
      style={[styles.container, { backgroundColor }, this.props.style]}
      onLayout={this.onContainerLayout}
    >
      <ScrollView
        ref={(scrollView) => { this.scrollView = scrollView; }}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        directionalLockEnabled={true}
        bounces={false}
        scrollsToTop={false}
      >
        <View
          style={[styles.tabs, { width: this.state.containerWidth, },
            this.props.tabsContainerStyle]}
          onLayout={this.onTabContainerLayout}
        >
          {tabs.map((name, page) => {
            const isTabActive = activeTab === page;
            return this.renderTab(name, page, isTabActive, goToPage,
              this.measureTab.bind(this, page));
          })}
          <Animated.View
            style={[tabUnderlineStyle, dynamicTabUnderline,
              this.props.underlineStyle]}
          />
        </View>
      </ScrollView>
    </View>);
  }
}

ScrollableTabBar.propTypes = propTypes;
ScrollableTabBar.defaultProps = defaultProps;

export default ScrollableTabBar;
