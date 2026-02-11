import { combineReducers } from '@reduxjs/toolkit';
import userReducer from '~/redux/features/userSlice';
import counterReducer from '~/redux/features/counterSlice';
import authReducer from '~/redux/features/authSlice';

const rootReducer = combineReducers({
  user: userReducer,
  counter: counterReducer,
  auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;