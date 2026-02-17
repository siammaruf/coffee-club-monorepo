import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { ContactMessagesService } from './contact-messages.service';
import { ReplyContactMessageDto } from './dto/reply-contact-message.dto';
import { UpdateContactMessageStatusDto } from './dto/update-contact-message-status.dto';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Contact Messages')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('contact-messages')
export class ContactMessagesController {
  constructor(private readonly contactMessagesService: ContactMessagesService) {}

    @Delete('bulk/delete')
    @ApiOperation({ summary: 'Bulk soft delete' })
    async bulkSoftDelete(@Body() body: { ids: string[] }): Promise<any> {
        await this.contactMessagesService.bulkSoftDelete(body.ids);
        return {
            status: 'success',
            message: `${body.ids.length} record(s) moved to trash.`,
            statusCode: HttpStatus.OK
        };
    }

    @Get('trash/list')
    @ApiOperation({ summary: 'List trashed records' })
    async findTrashed(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ): Promise<any> {
        const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        const { data, total } = await this.contactMessagesService.findTrashed({ page: pageNumber, limit: limitNumber, search });
        return {
            data,
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
            status: 'success',
            message: 'Trashed records retrieved successfully.',
            statusCode: HttpStatus.OK
        };
    }


  @Get()
  @ApiOperation({ summary: 'List all contact messages', description: 'Retrieves a paginated list of all contact messages' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, email, or subject' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status', enum: ['new', 'read', 'replied'] })
  @ApiResponse({ status: 200, description: 'Contact messages retrieved successfully' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    const result = await this.contactMessagesService.findAll({
      page: pageNumber,
      limit: limitNumber,
      search,
      status,
    });

    const totalPages = Math.ceil(result.total / limitNumber);

    return {
      data: result.data,
      total: result.total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
      status: 'success',
      message: 'Contact messages retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact message by ID', description: 'Retrieves a single contact message by ID' })
  @ApiParam({ name: 'id', description: 'Contact message ID' })
  @ApiResponse({ status: 200, description: 'Contact message retrieved successfully' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const message = await this.contactMessagesService.findOne(id);
    return {
      data: message,
      status: 'success',
      message: 'Contact message retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Put(':id/reply')
  @ApiOperation({ summary: 'Reply to contact message', description: 'Sets admin reply and marks message as replied' })
  @ApiParam({ name: 'id', description: 'Contact message ID' })
  @ApiResponse({ status: 200, description: 'Reply sent successfully' })
  async reply(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ReplyContactMessageDto,
  ) {
    const message = await this.contactMessagesService.reply(id, body.reply);
    return {
      data: message,
      status: 'success',
      message: 'Reply sent successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update contact message status', description: 'Updates the status of a contact message' })
  @ApiParam({ name: 'id', description: 'Contact message ID' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateContactMessageStatusDto,
  ) {
    const message = await this.contactMessagesService.updateStatus(id, body.status);
    return {
      data: message,
      status: 'success',
      message: 'Status updated successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete contact message', description: 'Deletes a contact message by ID' })
  @ApiParam({ name: 'id', description: 'Contact message ID' })
  @ApiResponse({ status: 200, description: 'Contact message deleted successfully' })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.contactMessagesService.remove(id);
    return {
      status: 'success',
      message: 'Contact message deleted successfully.',
      statusCode: HttpStatus.OK,
    };
  }

    @Patch(':id/restore')
    @ApiOperation({ summary: 'Restore from trash' })
    async restore(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.contactMessagesService.restore(id);
        return {
            status: 'success',
            message: 'Record restored successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Delete(':id/permanent')
    @ApiOperation({ summary: 'Permanently delete' })
    async permanentDelete(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.contactMessagesService.permanentDelete(id);
        return {
            status: 'success',
            message: 'Record permanently deleted.',
            statusCode: HttpStatus.OK
        };
    }
}
