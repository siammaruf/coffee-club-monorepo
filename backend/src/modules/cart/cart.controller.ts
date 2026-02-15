import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './providers/cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CustomerJwtAuthGuard } from '../customer-auth/guards/customer-jwt-auth.guard';
import { CurrentCustomer } from '../../common/decorators/customer.decorator';
import { Customer } from '../customers/entities/customer.entity';
import { Public } from '../../common/decorators/public.decorator';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Customer Cart')
@ApiBearerAuth('customer-auth')
@ApiErrorResponses()
@Public()
@Controller('customer/cart')
@UseGuards(CustomerJwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get cart', description: 'Get customer cart with items and totals' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  async getCart(@CurrentCustomer() customer: Customer) {
    const cart = await this.cartService.getCart(customer.id);
    return {
      data: cart,
      status: 'success',
      message: 'Cart retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart', description: 'Add item to cart or increment quantity if already exists' })
  @ApiBody({ type: AddToCartDto })
  @ApiResponse({ status: 200, description: 'Item added to cart successfully' })
  async addItem(
    @CurrentCustomer() customer: Customer,
    @Body() dto: AddToCartDto,
  ) {
    const cart = await this.cartService.addItem(customer.id, dto);
    return {
      data: cart,
      status: 'success',
      message: 'Item added to cart successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Put('items/:id')
  @ApiOperation({ summary: 'Update cart item', description: 'Update quantity or notes (set quantity to 0 to remove)' })
  @ApiParam({ name: 'id', description: 'Cart item ID' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: 200, description: 'Cart item updated successfully' })
  async updateItem(
    @CurrentCustomer() customer: Customer,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const cart = await this.cartService.updateItem(customer.id, id, dto);
    return {
      data: cart,
      status: 'success',
      message: 'Cart item updated successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove cart item', description: 'Remove an item from the cart' })
  @ApiParam({ name: 'id', description: 'Cart item ID' })
  @ApiResponse({ status: 200, description: 'Cart item removed successfully' })
  async removeItem(
    @CurrentCustomer() customer: Customer,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const cart = await this.cartService.removeItem(customer.id, id);
    return {
      data: cart,
      status: 'success',
      message: 'Cart item removed successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart', description: 'Remove all items from the cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  async clearCart(@CurrentCustomer() customer: Customer) {
    const cart = await this.cartService.clearCart(customer.id);
    return {
      data: cart,
      status: 'success',
      message: 'Cart cleared successfully.',
      statusCode: HttpStatus.OK,
    };
  }
}
