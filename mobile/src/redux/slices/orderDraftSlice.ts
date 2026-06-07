import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OrderDraftItem {
  item_id: string;
  item_variation_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name: string;
  product_type: string;
}

interface OrderDraftState {
  items: OrderDraftItem[];
}

const initialState: OrderDraftState = {
  items: [],
};

const orderDraftSlice = createSlice({
  name: 'orderDraft',
  initialState,
  reducers: {
    addDraftItem: (state, action: PayloadAction<OrderDraftItem>) => {
      const existing = state.items.find(
        (i) => i.item_id === action.payload.item_id && i.item_variation_id === action.payload.item_variation_id,
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
        existing.total_price = existing.quantity * existing.unit_price;
      } else {
        state.items.push(action.payload);
      }
    },
    incrementDraftItem: (state, action: PayloadAction<{ item_id: string; item_variation_id: string | null }>) => {
      const existing = state.items.find(
        (i) => i.item_id === action.payload.item_id && i.item_variation_id === action.payload.item_variation_id,
      );
      if (existing) {
        existing.quantity += 1;
        existing.total_price = existing.quantity * existing.unit_price;
      }
    },
    decrementDraftItem: (state, action: PayloadAction<{ item_id: string; item_variation_id: string | null }>) => {
      const existing = state.items.find(
        (i) => i.item_id === action.payload.item_id && i.item_variation_id === action.payload.item_variation_id,
      );
      if (existing) {
        if (existing.quantity > 1) {
          existing.quantity -= 1;
          existing.total_price = existing.quantity * existing.unit_price;
        } else {
          state.items = state.items.filter(
            (i) => !(i.item_id === action.payload.item_id && i.item_variation_id === action.payload.item_variation_id),
          );
        }
      }
    },
    removeDraftItem: (state, action: PayloadAction<{ item_id: string; item_variation_id: string | null }>) => {
      state.items = state.items.filter(
        (i) => !(i.item_id === action.payload.item_id && i.item_variation_id === action.payload.item_variation_id),
      );
    },
    clearDraftItems: (state) => {
      state.items = [];
    },
  },
});

export const { addDraftItem, incrementDraftItem, decrementDraftItem, removeDraftItem, clearDraftItems } =
  orderDraftSlice.actions;
export default orderDraftSlice.reducer;
