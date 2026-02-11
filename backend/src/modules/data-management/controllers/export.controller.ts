import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';

import { ExportService } from '../providers/export.service';
import { ExportDataDto } from '../dto/export-data.dto';
import { ExportGroup } from '../enums/export-group.enum';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/enum/user-role.enum';

@ApiTags('Data Management - Export')
@Controller('data-management/export')
@Roles(UserRole.ADMIN)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('groups')
  @ApiOperation({ summary: 'Get available export groups with record counts' })
  @ApiResponse({
    status: 200,
    description: 'Export groups retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              group: { type: 'string', example: 'menu' },
              label: { type: 'string', example: 'Menu' },
              description: { type: 'string', example: 'Items, categories, and item-category mappings' },
              entities: {
                type: 'array',
                items: { type: 'string' },
                example: ['Item', 'Category', 'ItemCategories'],
              },
              record_count: { type: 'number', example: 42 },
            },
          },
        },
        status: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Success' },
        statusCode: { type: 'number', example: 200 },
      },
    },
  })
  async getGroups() {
    return this.exportService.getExportGroups();
  }

  @Post('excel')
  @ApiOperation({ summary: 'Export selected groups to Excel file' })
  @ApiResponse({
    status: 200,
    description: 'Excel file generated and returned as download',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid export groups or parameters' })
  async exportExcel(
    @Body() dto: ExportDataDto,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.exportService.exportToExcel(dto);
    const filename = `coffeeclub_export_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );
    res.status(HttpStatus.OK).send(buffer);
  }

  @Get('template/:group')
  @ApiOperation({ summary: 'Download empty import template for a specific group' })
  @ApiParam({
    name: 'group',
    description: 'The export group to generate a template for',
    enum: ExportGroup,
    example: ExportGroup.MENU,
  })
  @ApiResponse({
    status: 200,
    description: 'Template Excel file returned as download',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid export group' })
  async downloadTemplate(
    @Param('group') group: ExportGroup,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.exportService.generateTemplate(group);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="template_${group}.xlsx"`,
    );
    res.status(HttpStatus.OK).send(buffer);
  }
}
