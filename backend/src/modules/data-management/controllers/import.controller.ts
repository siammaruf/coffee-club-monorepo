import {
  Controller,
  Post,
  Body,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBasicAuth,
} from '@nestjs/swagger';

import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/enum/user-role.enum';
import { ImportService } from '../providers/import.service';
import { ImportDataDto } from '../dto/import-data.dto';
import { ImportPreview, ImportResult } from '../interfaces/backup-metadata.interface';

@ApiTags('Data Management - Import')
@Controller('data-management/import')
@ApiBasicAuth()
@Roles(UserRole.ADMIN)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('preview')
  @ApiOperation({
    summary: 'Upload Excel file and preview import',
    description:
      'Parses the uploaded .xlsx file, validates all rows against entity schemas, ' +
      'and returns a preview with row counts and per-row validation errors without persisting anything.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel (.xlsx) file to preview',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Import preview generated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or parsing error',
  })
  @UseInterceptors(FileInterceptor('file'))
  async preview(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{
    data: ImportPreview;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    if (!file) {
      throw new BadRequestException('No file uploaded. Please attach an Excel (.xlsx) file.');
    }

    const preview = await this.importService.parseAndPreview(file);

    return {
      data: preview,
      status: 'success',
      message: 'Import preview generated successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Post('execute')
  @ApiOperation({
    summary: 'Execute import from uploaded Excel file',
    description:
      'Parses the uploaded .xlsx file and imports all valid rows into the database. ' +
      'Supports INSERT (skip duplicates) and UPSERT (update existing) modes. ' +
      'The import runs inside a single database transaction. ' +
      'Set skip_errors to true to continue on row-level errors instead of aborting.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel (.xlsx) file to import',
        },
        mode: {
          type: 'string',
          enum: ['insert', 'upsert'],
          description: 'Import mode: insert (skip duplicates) or upsert (update existing)',
        },
        skip_errors: {
          type: 'boolean',
          description: 'Whether to skip rows that produce errors and continue importing',
        },
      },
      required: ['file', 'mode'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Import executed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Import failed due to validation or data errors',
  })
  @UseInterceptors(FileInterceptor('file'))
  async execute(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImportDataDto,
  ): Promise<{
    data: ImportResult;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    if (!file) {
      throw new BadRequestException('No file uploaded. Please attach an Excel (.xlsx) file.');
    }

    const result = await this.importService.executeImport(file, dto);

    const totalImported = Object.values(result.imported_counts).reduce(
      (sum, count) => sum + count,
      0,
    );

    return {
      data: result,
      status: 'success',
      message: `Import completed successfully. ${totalImported} records imported.`,
      statusCode: HttpStatus.OK,
    };
  }
}
