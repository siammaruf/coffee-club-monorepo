export class CartItemResponseDto {
  id: string;
  item: {
    id: string;
    name: string;
    name_bn: string;
    image: string;
    regular_price: number;
    sale_price: number;
  };
  quantity: number;
  special_notes: string | null;
  line_total: number;

  constructor(cartItem: any) {
    this.id = cartItem.id;
    this.item = {
      id: cartItem.item?.id,
      name: cartItem.item?.name,
      name_bn: cartItem.item?.name_bn,
      image: cartItem.item?.image,
      regular_price: Number(cartItem.item?.regular_price) || 0,
      sale_price: Number(cartItem.item?.sale_price) || 0,
    };
    this.quantity = cartItem.quantity;
    this.special_notes = cartItem.special_notes;
    const price = this.item.sale_price > 0 ? this.item.sale_price : this.item.regular_price;
    this.line_total = price * this.quantity;
  }
}

export class CartResponseDto {
  id: string;
  items: CartItemResponseDto[];
  total: number;
  item_count: number;

  constructor(cart: any) {
    this.id = cart.id;
    this.items = (cart.items || []).map((item: any) => new CartItemResponseDto(item));
    this.total = this.items.reduce((sum, item) => sum + item.line_total, 0);
    this.item_count = this.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
