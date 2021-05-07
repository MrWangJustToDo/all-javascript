// redux  基于Context实现

class Store {
  constructor(reducer, initalState, middleware) {
    this.reducer = reducer;
    this.state = initalState;
    this.middleware = middleware;
    this.listener = [];
    if (this.middleware && this.middleware.length) {
      // 包装原始dispatch
      this.dispatch = this.middleware.reduce(
        (pre, current) => current(this)(pre),
        this.initalDispatch
      );
      /*
      中间件的使用 
        (store) => (next) => (action) => {
          调用 next() 进入下一个中间件
        }
      */
    } else {
      this.dispatch = this.initalDispatch;
    }
  }

  applyMiddleware = (...middleware) => {
    return middleware.reverse();
  };

  getState = () => {
    return this.state;
  };

  initalDispatch = (action) => {
    this.state = this.reducer(this.state, action);
    this.listeners.forEach((listener) => listener());
  };

  subscribe = (listener) => {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter((it) => it !== listener);
    };
  };
}

function createStore(reducer, initalState, middleware) {
  return new Store(reducer, initalState, middleware);
}

let StoreContext = createContext();

// 实现react-redux的Provider组件, 用法<Provider store={store}></Provider>
function Provider({ store, children }) {
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

// 实现react-redux的useSelector() hook函数, 从store存储的数据中提取数据
function useSelector(selector) {
  let store = useContext(StoreContext);
  return selector(store.getState());
}

// 实现react-redux的useDispath() hook函数, 使用store对象派发操作
function useDispatch() {
  let store = useContext(StoreContext);
  return function (action) {
    store.dispatch(action);
  };
}

// 实现react-redux的useStore()  hook函数, 直接获取store对象
function useStore() {
  return useContext(StoreContext);
}

const bindActionCreators = (mapDispatchToProps, dispatch) => {
  const re = {};
  for (let key in mapDispatchToProps) {
    re[key] = (data) => dispatch(mapDispatchToProps[key](data));
  }
  return re;
};

function connect(mapStateToProps, mapDispatchToProps) {
  return function (Warper) {
    return (props) => {
      const store = useStore();

      const { children } = props;

      const stateToProps = mapStateToProps
        ? mapStateToProps(store.getState(), props)
        : {};
      const dispathToProps = mapDispatchToProps
        ? typeof mapDispatchToProps === "function"
          ? mapDispatchToProps(store.dispatch, props)
          : bindActionCreators(mapDispatchToProps, store.dispatch)
        : {};

      return (
        <Warper {...props} {...stateToProps} {...dispathToProps}>
          {children}
        </Warper>
      );
    };
  };
}
