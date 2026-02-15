import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BankService } from './providers/bank.service';
import { UpdateBankDto } from './dto/update-bank.dto';
import { BankResponseDto } from './dto/bank-response.dto';
import { CreateBankDto } from './dto/create-bank.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Banks')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Controller('banks')
@Roles(UserRole.ADMIN)
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Post(':userId')
  @ApiOperation({ summary: 'Create a new bank record for a user' })
  @ApiResponse({ status: 201, type: BankResponseDto })
  async create(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() createBankDto: CreateBankDto
  ): Promise<BankResponseDto> {
    const bank = await this.bankService.create(createBankDto, userId);
    return new BankResponseDto(bank);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all banks for a user' })
  @ApiResponse({ status: 200, type: [BankResponseDto] })
  async findByUserId(@Param('userId', ParseUUIDPipe) userId: string): Promise<BankResponseDto[]> {
    const banks = await this.bankService.findByUserId(userId);
    return banks.map(bank => new BankResponseDto(bank));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bank by ID' })
  @ApiResponse({ status: 200, type: BankResponseDto })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<BankResponseDto> {
    const bank = await this.bankService.findOne(id);
    return new BankResponseDto(bank);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update bank record' })
  @ApiResponse({ status: 200, type: BankResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBankDto: UpdateBankDto
  ): Promise<BankResponseDto> {
    const bank = await this.bankService.update(id, updateBankDto);
    return new BankResponseDto(bank);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete bank record' })
  @ApiResponse({ status: 200, description: 'Bank deleted successfully' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.bankService.remove(id);
  }
}
