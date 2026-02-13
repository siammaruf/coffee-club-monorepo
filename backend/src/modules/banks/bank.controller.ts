import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBasicAuth } from '@nestjs/swagger';
import { BankService } from './providers/bank.service';
import { UpdateBankDto } from './dto/update-bank.dto';
import { BankResponseDto } from './dto/bank-response.dto';
import { CreateBankDto } from './dto/create-bank.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';

@ApiTags('Banks')
@Controller('banks')
@ApiBasicAuth()
@Roles(UserRole.ADMIN)
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Post(':userId')
  @ApiOperation({ summary: 'Create a new bank record for a user' })
  @ApiResponse({ status: 201, type: BankResponseDto })
  @ApiBasicAuth()
  async create(
    @Param('userId') userId: string,
    @Body() createBankDto: CreateBankDto
  ): Promise<BankResponseDto> {
    const bank = await this.bankService.create(createBankDto, userId);
    return new BankResponseDto(bank);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all banks for a user' })
  @ApiResponse({ status: 200, type: [BankResponseDto] })
  @ApiBasicAuth()
  async findByUserId(@Param('userId') userId: string): Promise<BankResponseDto[]> {
    const banks = await this.bankService.findByUserId(userId);
    return banks.map(bank => new BankResponseDto(bank));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bank by ID' })
  @ApiResponse({ status: 200, type: BankResponseDto })
  @ApiBasicAuth()
  async findOne(@Param('id') id: string): Promise<BankResponseDto> {
    const bank = await this.bankService.findOne(id);
    return new BankResponseDto(bank);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update bank record' })
  @ApiResponse({ status: 200, type: BankResponseDto })
  @ApiBasicAuth()
  async update(
    @Param('id') id: string,
    @Body() updateBankDto: UpdateBankDto
  ): Promise<BankResponseDto> {
    const bank = await this.bankService.update(id, updateBankDto);
    return new BankResponseDto(bank);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete bank record' })
  @ApiResponse({ status: 200, description: 'Bank deleted successfully' })
  @ApiBasicAuth()
  async remove(@Param('id') id: string): Promise<void> {
    return this.bankService.remove(id);
  }
}