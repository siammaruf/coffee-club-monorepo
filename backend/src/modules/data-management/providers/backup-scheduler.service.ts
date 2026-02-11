import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

import { BackupSettings } from '../entities/backup-settings.entity';
import { BackupType } from '../enums/backup-type.enum';
import { BackupService } from './backup.service';
import { UpdateBackupSettingsDto } from '../dto/update-backup-settings.dto';

@Injectable()
export class BackupSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(BackupSchedulerService.name);
  private readonly CRON_JOB_NAME = 'auto-backup';

  constructor(
    @InjectRepository(BackupSettings)
    private readonly settingsRepo: Repository<BackupSettings>,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly backupService: BackupService,
  ) {}

  async onModuleInit(): Promise<void> {
    let settings = await this.settingsRepo.findOne({ where: {} });

    if (!settings) {
      settings = this.settingsRepo.create();
      settings = await this.settingsRepo.save(settings);
      this.logger.log('Created default backup settings');
    }

    if (settings.auto_backup_enabled) {
      this.registerCronJob(settings.cron_expression);
      this.logger.log(
        `Auto-backup schedule initialized with cron: ${settings.cron_expression}`,
      );
    } else {
      this.logger.log('Auto-backup is disabled');
    }
  }

  async updateSchedule(settings: BackupSettings): Promise<void> {
    // Remove existing cron job if it exists
    try {
      if (this.schedulerRegistry.doesExist('cron', this.CRON_JOB_NAME)) {
        this.schedulerRegistry.deleteCronJob(this.CRON_JOB_NAME);
        this.logger.log('Removed existing auto-backup cron job');
      }
    } catch {
      // Job does not exist, nothing to remove
    }

    if (settings.auto_backup_enabled) {
      this.registerCronJob(settings.cron_expression);
      this.logger.log(
        `Auto-backup schedule updated with cron: ${settings.cron_expression}`,
      );
    } else {
      this.logger.log('Auto-backup has been disabled');
    }
  }

  private registerCronJob(cronExpression: string): void {
    const job = new CronJob(cronExpression, () => {
      this.handleScheduledBackup();
    });

    this.schedulerRegistry.addCronJob(this.CRON_JOB_NAME, job);
    job.start();
  }

  async handleScheduledBackup(): Promise<void> {
    this.logger.log('Running scheduled backup...');
    try {
      await this.backupService.createBackup(undefined, BackupType.SCHEDULED);
      await this.cleanupOldBackups();
      this.logger.log('Scheduled backup completed successfully');
    } catch (error) {
      this.logger.error(
        'Scheduled backup failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async cleanupOldBackups(): Promise<void> {
    const settings = await this.settingsRepo.findOne({ where: {} });
    if (!settings) return;

    await this.backupService.deleteOldBackups(
      settings.retention_days,
      settings.max_backups,
    );
  }

  async getSettings(): Promise<BackupSettings> {
    let settings = await this.settingsRepo.findOne({ where: {} });
    if (!settings) {
      settings = this.settingsRepo.create();
      settings = await this.settingsRepo.save(settings);
    }
    return settings;
  }

  async updateSettings(
    dto: UpdateBackupSettingsDto,
  ): Promise<BackupSettings> {
    let settings = await this.getSettings();
    Object.assign(settings, dto);
    settings = await this.settingsRepo.save(settings);
    await this.updateSchedule(settings);
    return settings;
  }
}
