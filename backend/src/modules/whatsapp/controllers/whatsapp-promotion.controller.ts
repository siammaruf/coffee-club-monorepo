import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { WhatsAppPromotionService } from '../providers/whatsapp-promotion.service';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { UpdatePromotionDto } from '../dto/update-promotion.dto';
import { PromotionTarget } from '../enums';

@ApiTags('WhatsApp Promotions')
@ApiBearerAuth('staff-auth')
@Controller('whatsapp/promotions')
export class WhatsAppPromotionController {
  constructor(private readonly promotionService: WhatsAppPromotionService) {}

  @Get()
  @RequirePermission('whatsapp.view')
  @ApiOperation({ summary: 'List promotions' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.promotionService.findAll({ page, limit, status });
  }

  @Post()
  @RequirePermission('whatsapp.manage')
  @ApiOperation({ summary: 'Create a promotion (DRAFT)' })
  async create(@Body() dto: CreatePromotionDto) {
    return this.promotionService.create(dto);
  }

  @Get('recipient-count')
  @RequirePermission('whatsapp.view')
  @ApiOperation({ summary: 'Get recipient count for a target' })
  @ApiQuery({ name: 'target', enum: PromotionTarget })
  async getRecipientCount(@Query('target') target: PromotionTarget) {
    const count = await this.promotionService.getRecipientCount(
      target || PromotionTarget.ALL,
    );
    return { count };
  }

  @Get(':id')
  @RequirePermission('whatsapp.view')
  @ApiOperation({ summary: 'Get promotion details' })
  async findOne(@Param('id') id: string) {
    return this.promotionService.findOne(id);
  }

  @Put(':id')
  @RequirePermission('whatsapp.manage')
  @ApiOperation({ summary: 'Update a draft promotion' })
  async update(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    return this.promotionService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('whatsapp.manage')
  @ApiOperation({ summary: 'Delete a promotion' })
  async remove(@Param('id') id: string) {
    await this.promotionService.remove(id);
    return { message: 'Promotion deleted' };
  }

  @Post(':id/send')
  @RequirePermission('whatsapp.send')
  @ApiOperation({ summary: 'Send promotion to targeted customers' })
  async send(@Param('id') id: string) {
    return this.promotionService.send(id);
  }
}
