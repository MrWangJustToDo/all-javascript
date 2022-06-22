const thunkMiddleware = (store) => (next) => (action) => {
  if (typeof action === "function") {
    action(store.dispatch, store);
  } else {
    next(action);
  }
};
