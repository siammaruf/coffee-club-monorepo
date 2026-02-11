import { createCipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { ConfigService } from '@nestjs/config';

export interface EncryptedData {
  encryptedPassword: string;
  iv: string;
}

export class EncryptionUtil {
  private static configService: ConfigService;

  static setConfigService(config: ConfigService) {
    this.configService = config;
  }

  private static getSalt(): string {
    const salt = this.configService?.get<string>('ENCRYPTION_SALT');
    if (!salt) {
      throw new Error(
        'ENCRYPTION_SALT is not defined in environment variables',
      );
    }
    return salt;
  }

  static async encryptPassword(password: string): Promise<EncryptedData> {
    const iv = randomBytes(16);
    const key = (await promisify(scrypt)(password, this.getSalt(), 32)) as Buffer;
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    const encryptedText = Buffer.concat([ cipher.update(password), cipher.final()]).toString('hex');
    return {
      encryptedPassword: encryptedText,
      iv: iv.toString('hex'),
    };
  }

  static async verifyPassword(password: string, storedPassword: string, storedIv: string): Promise<boolean> {
    try {
        const key = (await promisify(scrypt)(password, this.getSalt(), 32)) as Buffer;
        const iv = Buffer.from(storedIv, 'hex');
        const cipher = createCipheriv('aes-256-cbc', key, iv);
        const encryptedText = Buffer.concat([cipher.update(password), cipher.final()]).toString('hex');
        return encryptedText === storedPassword;
    } catch (error) {
        return false;
    }
  }
}
