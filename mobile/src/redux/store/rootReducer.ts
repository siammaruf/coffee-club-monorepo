import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import userReducer from '../slices/userSlice';
import orderDraftReducer from '../slices/orderDraftSlice';

const rootReducer = combineReducers({
    auth: authReducer,
    user: userReducer,
    orderDraft: orderDraftReducer,
});

export default rootReducer;
