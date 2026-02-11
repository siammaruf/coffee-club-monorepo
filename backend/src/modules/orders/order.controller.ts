import { Body, Controller, Delete, Get, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { OrderService } from './providers/order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all orders with pagination and filtering',
    description: 'Retrieves a paginated list of all orders with optional search and date filtering functionality'
  })
  @ApiQuery({ 
    name: 'page', 
    type: 'number', 
    required: false,
    description: 'Page number for pagination (default: 1)',
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    type: 'number', 
    required: false,
    description: 'Number of orders per page (default: 10)',
    example: 10
  })
  @ApiQuery({ 
    name: 'search', 
    type: 'string', 
    required: false,
    description: 'Search term to filter orders by order type, status, payment method, customer name, or user name',
    example: 'dine-in'
  })
  @ApiQuery({ 
    name: 'dateFilter', 
    enum: ['today', 'custom', 'all'],
    required: false,
    description: 'Date filter option: today (orders from today), custom (orders within date range), all (no date filter)',
    example: 'today'
  })
  @ApiQuery({ 
    name: 'startDate', 
    type: 'string',
    format: 'date',
    required: false,
    description: 'Start date for custom date filter (YYYY-MM-DD format). Required when dateFilter is "custom"',
    example: '2024-01-01'
  })
  @ApiQuery({ 
    name: 'endDate', 
    type: 'string',
    format: 'date',
    required: false,
    description: 'End date for custom date filter (YYYY-MM-DD format). Required when dateFilter is "custom"',
    example: '2024-01-31'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Orders retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
              order_type: { type: 'string', enum: ['DINEIN', 'TAKEAWAY', 'DELIVERY'], example: 'DINEIN' },
              tables: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid', example: 'table-uuid-1' },
                    name: { type: 'string', example: 'Table 1' },
                    capacity: { type: 'number', example: 4 },
                    status: { type: 'string', example: 'OCCUPIED' }
                  }
                },
                example: [{ id: 'table-uuid-1', name: 'Table 1', capacity: 4, status: 'OCCUPIED' }]
              },
              customer: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid', example: 'customer-uuid-1' },
                  name: { type: 'string', example: 'John Doe' },
                  phone: { type: 'string', example: '+1234567890' }
                },
                nullable: true
              },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid', example: 'user-uuid-1' },
                  name: { type: 'string', example: 'Server Name' },
                  role: { type: 'string', example: 'SERVER' }
                },
                nullable: true
              },
              status: { type: 'string', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'], example: 'COMPLETED' },
              total_amount: { type: 'number', example: 45.50 },
              discount_amount: { type: 'number', example: 5.00 },
              completion_time: { type: 'number', example: 25 },
              payment_method: { type: 'string', enum: ['CASH', 'CARD', 'MOBILE'], example: 'CARD' },
              order_items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid', example: 'item-uuid-1' },
                    item: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid', example: 'menu-item-uuid-1' },
                        name: { type: 'string', example: 'Cappuccino' },
                        price: { type: 'number', example: 4.50 },
                        category: { type: 'string', example: 'Beverages' }
                      }
                    },
                    quantity: { type: 'number', example: 2 },
                    unit_price: { type: 'number', example: 4.50 },
                    total_price: { type: 'number', example: 9.00 },
                    notes: { type: 'string', example: 'Extra hot', nullable: true }
                  }
                },
                example: [{
                  id: 'item-uuid-1',
                  item: { id: 'menu-item-uuid-1', name: 'Cappuccino', price: 4.50, category: 'Beverages' },
                  quantity: 2,
                  unit_price: 4.50,
                  total_price: 9.00,
                  notes: 'Extra hot'
                }]
              },
              created_at: { type: 'string', format: 'date-time', example: '2024-01-20T14:30:00.000Z' },
              updated_at: { type: 'string', format: 'date-time', example: '2024-01-20T14:55:00.000Z' }
            }
          }
        },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 5 },
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Orders retrieved successfully.' },
        statusCode: { type: 'number', example: 200 }
      }
    }
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('dateFilter') dateFilter?: 'today' | 'custom' | 'all',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<{ data: OrderResponseDto[]; total: number; page: number; limit: number; totalPages: number; status: string; message: string; statusCode: HttpStatus }> {
    const result = await this.orderService.findAll(page, limit, search, dateFilter, startDate, endDate);
    return {
      data: result.data.map(order => new OrderResponseDto(order)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      status: 'success',
      message: 'Orders retrieved successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create a new order',
    description: 'Creates a new order with order items and automatically generates tokens for bar and kitchen based on item types'
  })
  @ApiBody({ 
    type: CreateOrderDto,
    description: 'Order creation data including order items'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Order created successfully',
    schema: {
      type: 'object',
      properties: {
        data: { 
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
            order_type: { type: 'string', enum: ['DINEIN', 'TAKEAWAY', 'DELIVERY'], example: 'DINEIN' },
            tables: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid', example: 'table-uuid-1' },
                  name: { type: 'string', example: 'Table 1' },
                  capacity: { type: 'number', example: 4 },
                  status: { type: 'string', example: 'OCCUPIED' }
                }
              },
              example: [{ id: 'table-uuid-1', name: 'Table 1', capacity: 4, status: 'OCCUPIED' }]
            },
            customer: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid', example: 'customer-uuid-1' },
                name: { type: 'string', example: 'John Doe' },
                phone: { type: 'string', example: '+1234567890' }
              },
              nullable: true
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid', example: 'user-uuid-1' },
                name: { type: 'string', example: 'Server Name' },
                role: { type: 'string', example: 'SERVER' }
              },
              nullable: true
            },
            status: { type: 'string', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'], example: 'PENDING' },
            total_amount: { type: 'number', example: 45.50 },
            discount_amount: { type: 'number', example: 5.00 },
            completion_time: { type: 'number', example: null },
            payment_method: { type: 'string', enum: ['CASH', 'CARD', 'MOBILE'], example: 'CARD' },
            order_items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid', example: 'item-uuid-1' },
                  item: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid', example: 'menu-item-uuid-1' },
                      name: { type: 'string', example: 'Cappuccino' },
                      price: { type: 'number', example: 4.50 },
                      category: { type: 'string', example: 'Beverages' }
                    }
                  },
                  quantity: { type: 'number', example: 2 },
                  unit_price: { type: 'number', example: 4.50 },
                  total_price: { type: 'number', example: 9.00 },
                  notes: { type: 'string', example: 'Extra hot', nullable: true }
                }
              },
              example: [{
                id: 'item-uuid-1',
                item: { id: 'menu-item-uuid-1', name: 'Cappuccino', price: 4.50, category: 'Beverages' },
                quantity: 2,
                unit_price: 4.50,
                total_price: 9.00,
                notes: 'Extra hot'
              }]
            },
            created_at: { type: 'string', format: 'date-time', example: '2024-01-20T14:30:00.000Z' },
            updated_at: { type: 'string', format: 'date-time', example: '2024-01-20T14:30:00.000Z' }
          }
        },
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Order created successfully.' },
        statusCode: { type: 'number', example: 201 }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid input data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Not found - One or more tables not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'One or more tables not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<{ data: OrderResponseDto; status: string; message: string; statusCode: HttpStatus }> {
    const order = await this.orderService.create(createOrderDto);
    return {
      data: new OrderResponseDto(order),
      status: 'success',
      message: 'Order created successfully.',
      statusCode: HttpStatus.CREATED
    };
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update an existing order',
    description: 'Updates an existing order by ID with new data. All fields are optional and only provided fields will be updated.'
  })
  @ApiParam({ 
    name: 'id', 
    type: 'string', 
    format: 'uuid',
    description: 'Unique identifier of the order to update',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  })
  @ApiBody({ 
    type: UpdateOrderDto,
    description: 'Order update data - all fields are optional',
    schema: {
      type: 'object',
      properties: {
        order_type: {
          type: 'string',
          enum: ['DINEIN', 'TAKEAWAY', 'DELIVERY'],
          description: 'Type of the order',
          example: 'DINEIN'
        },
        tables: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: 'table-uuid-1' }
            }
          },
          description: 'Array of table objects to associate with the order',
          example: [{ id: 'table-uuid-1' }, { id: 'table-uuid-2' }]
        },
        customer_id: {
          type: 'string',
          format: 'uuid',
          description: 'Customer ID for direct reference',
          example: 'customer-uuid-1',
          nullable: true
        },
        user_id: {
          type: 'string',
          format: 'uuid',
          description: 'User ID for direct reference',
          example: 'user-uuid-1'
        },
        status: {
          type: 'string',
          enum: ['PENDING', 'PREPARING', 'COMPLETED', 'CANCELLED'],
          description: 'Current status of the order',
          example: 'COMPLETED'
        },
        sub_total: {
          type: 'number',
          description: 'Subtotal amount before discounts and taxes',
          example: 50.00
        },
        total_amount: {
          type: 'number',
          description: 'Total amount of the order',
          example: 45.50
        },
        discount_id: {
          type: 'string',
          format: 'uuid',
          description: 'Discount ID for direct reference',
          example: 'discount-uuid-1',
          nullable: true
        },
        discount_amount: {
          type: 'number',
          description: 'Discount amount applied to the order',
          example: 5.00
        },
        completion_time: {
          type: 'number',
          description: 'Total time taken to complete the order in minutes',
          example: 25
        },
        payment_method: {
          type: 'string',
          enum: ['CASH', 'CARD', 'MOBILE'],
          description: 'Payment method used for the order',
          example: 'CARD'
        },
        order_items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              item: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid', example: 'menu-item-uuid-1' }
                }
              },
              quantity: { type: 'number', example: 2 },
              unit_price: { type: 'number', example: 4.50 },
              total_price: { type: 'number', example: 9.00 }
            }
          },
          description: 'Array of order items to update',
          example: [{
            item: { id: 'menu-item-uuid-1' },
            quantity: 2,
            unit_price: 4.50,
            total_price: 9.00
          }]
        },
        redeem_amount: {
          type: 'number',
          description: 'Amount to redeem from customer points',
          example: 10.00
        }
      },
      example: {
        status: 'COMPLETED',
        payment_method: 'CARD',
        completion_time: 25,
        redeem_amount: 10.00
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Order updated successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/OrderResponseDto' },
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Order updated successfully.' },
        statusCode: { type: 'number', example: 200 }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid input data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Not found - Order or tables not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Order not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto
  ): Promise<{ data: OrderResponseDto; status: string; message: string; statusCode: HttpStatus }> {
    const order = await this.orderService.update(id, updateOrderDto);
    return {
      data: new OrderResponseDto(order),
      status: 'success',
      message: 'Order updated successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get order by ID',
    description: 'Retrieves a specific order by its unique identifier with all related data'
  })
  @ApiParam({ 
    name: 'id', 
    type: 'string', 
    format: 'uuid',
    description: 'Unique identifier of the order to retrieve',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Order retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/OrderResponseDto' },
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Order retrieved successfully.' },
        statusCode: { type: 'number', example: 200 }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Not found - Order with specified ID does not exist',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Order not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<{ data: OrderResponseDto; status: string; message: string; statusCode: HttpStatus }> {
    const order = await this.orderService.findOne(id);
    return {
      data: new OrderResponseDto(order),
      status: 'success',
      message: 'Order retrieved successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order', description: 'Delete an order by its unique identifier' })
  @ApiParam({ name: 'id', description: 'Order ID', type: 'string', format: 'uuid' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Order deleted successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/OrderResponseDto' },
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Order deleted successfully.' },
        statusCode: { type: 'number', example: 200 }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ data: OrderResponseDto; status: string; message: string; statusCode: HttpStatus }> {
    const order = await this.orderService.remove(id);
    return {
      data: new OrderResponseDto(order),
      status: 'success',
      message: 'Order deleted successfully.',
      statusCode: HttpStatus.OK
    };
  }
}