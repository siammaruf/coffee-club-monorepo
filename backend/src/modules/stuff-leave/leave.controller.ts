import { Controller, Get, Post, Body, Param, Put, Delete, Patch, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { LeaveService } from './providers/leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { LeaveStatus } from './enum/leave-status.enum';
import { Leave } from './entities/leave.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';

@ApiTags('leaves')
@Controller('leaves')
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STUFF, UserRole.BARISTA, UserRole.CHEF)
export class LeaveController {
    constructor(private readonly leaveService: LeaveService) {}

    @Post()
    @ApiCookieAuth()
    @ApiOperation({ summary: 'Create a new leave request' })
    @ApiResponse({ status: 201, description: 'Leave request created successfully', type: Leave })
    @ApiResponse({ status: 400, description: 'Bad request' })
    create(@Body() createLeaveDto: CreateLeaveDto): Promise<Leave> {
        return this.leaveService.create(createLeaveDto);
    }

    @Get()
    @ApiCookieAuth()
    @ApiOperation({ summary: 'Get all leave requests' })
    @ApiResponse({ status: 200, description: 'Return all leave requests', type: [Leave] })
    findAll(): Promise<Leave[]> {
        return this.leaveService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a leave request by id' })
    @ApiResponse({ status: 200, description: 'Return the leave request', type: Leave })
    @ApiResponse({ status: 404, description: 'Leave request not found' })
    findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Leave> {
        return this.leaveService.findOne(id);
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get all leave requests for a specific user' })
    @ApiResponse({ status: 200, description: 'Return user\'s leave requests', type: [Leave] })
    findByUser(@Param('userId', ParseUUIDPipe) userId: string): Promise<Leave[]> {
        return this.leaveService.findByUser(userId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a leave request' })
    @ApiResponse({ status: 200, description: 'Leave request updated successfully', type: Leave })
    @ApiResponse({ status: 404, description: 'Leave request not found' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateLeaveDto: UpdateLeaveDto,
    ): Promise<Leave> {
        return this.leaveService.update(id, updateLeaveDto);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update leave request status' })
    @ApiResponse({ status: 200, description: 'Leave status updated successfully', type: Leave })
    @ApiResponse({ status: 404, description: 'Leave request not found' })
    updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('status') status: LeaveStatus,
    ): Promise<Leave> {
        return this.leaveService.updateStatus(id, status);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a leave request' })
    @ApiResponse({ status: 200, description: 'Leave request deleted successfully' })
    @ApiResponse({ status: 404, description: 'Leave request not found' })
    remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.leaveService.remove(id);
    }
}