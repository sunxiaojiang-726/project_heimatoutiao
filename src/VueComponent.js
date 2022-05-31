import Vue from 'vue'
// 使用插件自动按需引入组件，并注册
import {
  NavBar,
  Form,
  Field,
  Button,
  Tabbar,
  TabbarItem,
  Icon,
  Tab,
  Tabs,
  Cell,
  List,
  PullRefresh,
  ActionSheet,
  Popup,
  Row,
  Col,
  Badge,
  Search,
  Image as VanImage,
  Divider,
  Tag,
  CellGroup,
  Dialog,
  DatetimePicker,
  Loading,
  Lazyload
} from 'vant'

// 引入注册完所需组件之后，就可以在任意界面使用它了
Vue.use(NavBar)
Vue.use(Form)
Vue.use(Field)
Vue.use(Button)
Vue.use(Tabbar)
Vue.use(TabbarItem)
Vue.use(Icon)
Vue.use(Tab)
Vue.use(Tabs)
Vue.use(Cell)
Vue.use(List)
Vue.use(PullRefresh)
Vue.use(ActionSheet)
Vue.use(Popup)
Vue.use(Row)
Vue.use(Col)
Vue.use(Badge)
Vue.use(Search)
Vue.use(VanImage)
Vue.use(Divider)
Vue.use(Tag)
Vue.use(CellGroup)
Vue.use(Dialog)
Vue.use(DatetimePicker)
Vue.use(Loading)
Vue.use(Lazyload, {
  preLoad: 0.9 // 预加载范围,当图片在屏幕的高度的0.9范围内时被加载(屏幕高度的范围是0-1)
})
