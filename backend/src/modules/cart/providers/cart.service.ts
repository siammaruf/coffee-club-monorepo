import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { Item } from '../../items/entities/item.entity';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CartResponseDto } from '../dto/cart-response.dto';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    private readonly cacheService: CacheService,
  ) {}

  private async invalidateCache(customerId: string): Promise<void> {
    const patterns = [`cart:${customerId}*`, 'cart:customer*'];
    for (const pattern of patterns) {
      const keys = await this.cacheService.getKeys(pattern);
      if (keys.length > 0) {
        await this.cacheService.deleteMany(keys);
      }
    }
  }

  async getOrCreateCart(customerId: string): Promise<Cart> {
    const cacheKey = `cart:customer:${customerId}`;
    const cached = await this.cacheService.get<Cart>(cacheKey);
    if (cached) {
      return cached;
    }

    let cart = await this.cartRepository.findOne({
      where: { customer: { id: customerId } },
      relations: ['items', 'items.item'],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        customer: { id: customerId } as any,
      });
      cart = await this.cartRepository.save(cart);
      cart.items = [];
    }

    await this.cacheService.set(cacheKey, cart, 15);
    return cart;
  }

  async getCart(customerId: string): Promise<CartResponseDto> {
    const cacheKey = `cart:${customerId}:response`;
    return this.cacheService.getOrSet(cacheKey, async () => {
      const cart = await this.getOrCreateCart(customerId);
      return new CartResponseDto(cart);
    }, 15);
  }

  async addItem(customerId: string, dto: AddToCartDto): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(customerId);

    // Verify item exists
    const item = await this.itemRepository.findOne({
      where: { id: dto.item_id },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${dto.item_id} not found`);
    }

    // Check if item already exists in cart
    let cartItem = await this.cartItemRepository.findOne({
      where: {
        cart: { id: cart.id },
        item: { id: dto.item_id },
      },
      relations: ['item'],
    });

    if (cartItem) {
      // Increment quantity
      cartItem.quantity += dto.quantity;
      if (dto.special_notes !== undefined) {
        cartItem.special_notes = dto.special_notes;
      }
      await this.cartItemRepository.save(cartItem);
    } else {
      // Create new cart item
      cartItem = this.cartItemRepository.create({
        cart: { id: cart.id } as any,
        item: { id: dto.item_id } as any,
        quantity: dto.quantity,
        special_notes: dto.special_notes || null,
      });
      await this.cartItemRepository.save(cartItem);
    }

    await this.invalidateCache(customerId);
    return this.getCart(customerId);
  }

  async updateItem(
    customerId: string,
    cartItemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(customerId);

    const cartItem = await this.cartItemRepository.findOne({
      where: {
        id: cartItemId,
        cart: { id: cart.id },
      },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    // If quantity is 0, remove the item
    if (dto.quantity !== undefined && dto.quantity === 0) {
      await this.cartItemRepository.remove(cartItem);
      return this.getCart(customerId);
    }

    if (dto.quantity !== undefined) {
      cartItem.quantity = dto.quantity;
    }

    if (dto.special_notes !== undefined) {
      cartItem.special_notes = dto.special_notes;
    }

    await this.cartItemRepository.save(cartItem);
    await this.invalidateCache(customerId);
    return this.getCart(customerId);
  }

  async removeItem(customerId: string, cartItemId: string): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(customerId);

    const cartItem = await this.cartItemRepository.findOne({
      where: {
        id: cartItemId,
        cart: { id: cart.id },
      },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    await this.cartItemRepository.remove(cartItem);
    await this.invalidateCache(customerId);
    return this.getCart(customerId);
  }

  async clearCart(customerId: string): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(customerId);

    await this.cartItemRepository.delete({ cart: { id: cart.id } });

    await this.invalidateCache(customerId);
    return this.getCart(customerId);
  }
}
