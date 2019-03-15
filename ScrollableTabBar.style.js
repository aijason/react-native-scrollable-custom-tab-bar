import { StyleSheet } from 'react-native';

// ScrollableTabBar组件样式
export default StyleSheet.create({
  tab: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },
  container: {
    height: 50,
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#e8e8e8',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  }
});
