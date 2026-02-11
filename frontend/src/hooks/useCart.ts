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
import type { Item } from '@/types/item'

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
    addItem: (item: Item, quantity?: number) => dispatch(addItem({ item, quantity })),
    removeItem: (itemId: string) => dispatch(removeItem(itemId)),
    updateQuantity: (itemId: string, quantity: number) => dispatch(updateQuantity({ itemId, quantity })),
    updateNotes: (itemId: string, notes: string) => dispatch(updateNotes({ itemId, notes })),
    clearCart: () => dispatch(clearCart()),
    toggleDrawer: () => dispatch(toggleDrawer()),
    openDrawer: () => dispatch(openDrawer()),
    closeDrawer: () => dispatch(closeDrawer()),
  }
}
