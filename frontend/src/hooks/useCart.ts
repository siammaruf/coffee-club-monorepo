import { useAppDispatch, useAppSelector } from '@/redux/store/hooks'
import {
  addItem,
  removeItem,
  updateQuantity,
  updateNotes,
  clearCart,
  toggleDrawer,
  openDrawer,
  closeDrawer,
  selectCartTotal,
  selectCartItemCount,
} from '@/redux/features/cartSlice'
import type { Item, ItemVariation } from '@/types/item'

export function useCart() {
  const dispatch = useAppDispatch()
  const { items, isOpen } = useAppSelector((state) => state.cart)
  const total = useAppSelector(selectCartTotal)
  const itemCount = useAppSelector(selectCartItemCount)

  return {
    items,
    isOpen,
    total,
    itemCount,
    addItem: (item: Item, quantity?: number, selectedVariation?: ItemVariation) =>
      dispatch(addItem({ item, quantity, selectedVariation })),
    removeItem: (cartItemId: string) => dispatch(removeItem(cartItemId)),
    updateQuantity: (cartItemId: string, quantity: number) =>
      dispatch(updateQuantity({ cartItemId, quantity })),
    updateNotes: (cartItemId: string, notes: string) =>
      dispatch(updateNotes({ cartItemId, notes })),
    clearCart: () => dispatch(clearCart()),
    toggleDrawer: () => dispatch(toggleDrawer()),
    openDrawer: () => dispatch(openDrawer()),
    closeDrawer: () => dispatch(closeDrawer()),
  }
}
