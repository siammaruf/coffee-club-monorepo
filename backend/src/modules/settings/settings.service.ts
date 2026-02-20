import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaults();
  }

  /**
   * Seed default settings if they do not already exist.
   */
  private async seedDefaults(): Promise<void> {
    const defaults: { key: string; value: string; description: string }[] = [
      {
        key: 'reservations_enabled',
        value: 'true',
        description: 'Enable or disable the reservation system',
      },
      {
        key: 'points_per_taka',
        value: '1',
        description: 'How many points a member earns per 1 taka spent',
      },
      {
        key: 'points_for_balance',
        value: '100',
        description: 'Number of points required for balance conversion',
      },
      {
        key: 'taka_per_100_points',
        value: '3',
        description: 'How many taka the customer gets per 100 points redeemed',
      },
      {
        key: 'minimum_redeem_amount',
        value: '100',
        description: 'Minimum taka amount required for redemption',
      },
    ];

    for (const def of defaults) {
      const existing = await this.settingRepository.findOne({
        where: { key: def.key },
      });

      if (!existing) {
        const setting = this.settingRepository.create(def);
        await this.settingRepository.save(setting);
        this.logger.log(`Seeded default setting: ${def.key} = ${def.value}`);
      }
    }
  }

  /**
   * Get a single setting value by key.
   * Returns null if the key does not exist.
   */
  async getSetting(key: string): Promise<string | null> {
    const setting = await this.settingRepository.findOne({ where: { key } });
    return setting ? setting.value : null;
  }

  /**
   * Get a single setting entity by key.
   * Throws NotFoundException if the key does not exist.
   */
  async getSettingEntity(key: string): Promise<Setting> {
    const setting = await this.settingRepository.findOne({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }
    return setting;
  }

  /**
   * Set or update a setting. Creates if it doesn't exist, updates if it does.
   */
  async setSetting(
    key: string,
    value: string,
    description?: string,
  ): Promise<Setting> {
    let setting = await this.settingRepository.findOne({ where: { key } });

    if (setting) {
      setting.value = value;
      if (description !== undefined) {
        setting.description = description;
      }
    } else {
      setting = this.settingRepository.create({
        key,
        value,
        description: description ?? null,
      });
    }

    return this.settingRepository.save(setting);
  }

  /**
   * Get all settings.
   */
  async getAllSettings(): Promise<Setting[]> {
    return this.settingRepository.find({ order: { key: 'ASC' } });
  }

  /**
   * Helper: check if reservations are enabled.
   * Defaults to true if the setting doesn't exist.
   */
  async isReservationEnabled(): Promise<boolean> {
    const value = await this.getSetting('reservations_enabled');
    if (value === null) {
      return true;
    }
    return value.toLowerCase() === 'true';
  }
}
