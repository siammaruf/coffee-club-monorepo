import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder?: string,
    publicId?: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder || 'coffee-club',
          public_id: publicId,
          resource_type: 'auto',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as UploadApiResponse);
          }
        },
      ).end(file.buffer);
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    options?: {
      folder?: string;
      publicId?: string;
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
      format?: string;
      lossless?: boolean;
    },
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    const { folder, publicId, width, height, crop, quality, format, lossless } = options || {};
    
    return new Promise((resolve, reject) => {
      const uploadOptions: any = {
        folder: folder || 'coffee-club/images',
        public_id: publicId,
        resource_type: 'image',
        transformation: [],
      };
  
      if (lossless) {
        uploadOptions.transformation.push(
          { quality: '100' },
          { fetch_format: 'webp' },
          { flags: 'lossy.false' }
        );
      } else {
        uploadOptions.transformation.push(
          { quality: quality || 'auto:best' },
          { fetch_format: format || 'webp' }
        );
      }
  
      if (width && height) {
        uploadOptions.transformation.push({
          width,
          height,
          crop: crop || 'fill',
        });
      }
  
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as UploadApiResponse);
          }
        },
      ).end(file.buffer);
    });
  }

  async deleteFile(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }

  async deleteFiles(publicIds: string[]): Promise<any> {
    return cloudinary.api.delete_resources(publicIds);
  }

  generateUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
      format?: string;
    },
  ): string {
    return cloudinary.url(publicId, {
      secure: true,
      ...options,
    });
  }

  async getResourceInfo(publicId: string): Promise<any> {
    return cloudinary.api.resource(publicId);
  }

  /**
   * Check if a URL is already hosted on Cloudinary.
   */
  isCloudinaryUrl(url: string): boolean {
    return url.includes('res.cloudinary.com') || url.includes('cloudinary.com');
  }

  /**
   * Upload an image from an external URL directly to Cloudinary.
   * Cloudinary fetches the image server-side — no need to download first.
   */
  async uploadFromUrl(
    url: string,
    options?: {
      folder?: string;
      width?: number;
      height?: number;
      crop?: string;
    },
  ): Promise<UploadApiResponse> {
    const { folder, width, height, crop } = options || {};

    const uploadOptions: any = {
      folder: folder || 'coffee-club',
      resource_type: 'image',
      transformation: [
        { quality: 'auto:best' },
        { fetch_format: 'webp' },
      ],
    };

    if (width && height) {
      uploadOptions.transformation.push({
        width,
        height,
        crop: crop || 'fill',
      });
    }

    return cloudinary.uploader.upload(url, uploadOptions);
  }

  /**
   * Ensure an image URL is hosted on Cloudinary.
   * - Returns null for empty/null values
   * - Returns as-is if already a Cloudinary URL
   * - Uploads to Cloudinary and returns the secure_url otherwise
   * - On failure, logs a warning and returns the original URL
   */
  async ensureCloudinaryUrl(
    url: string | null | undefined,
    folder: string,
  ): Promise<string | null> {
    if (!url || url.trim() === '') return null;

    if (this.isCloudinaryUrl(url)) return url;

    // Skip relative paths (e.g. "/img/pizza.png") — these are local assets, not external URLs
    if (url.startsWith('/') && !url.startsWith('//')) return url;

    try {
      const result = await this.uploadFromUrl(url, { folder });
      return result.secure_url;
    } catch (error: any) {
      this.logger.warn(
        `Failed to upload image from URL to Cloudinary: ${url} — ${error?.message || 'Unknown error'}`,
      );
      return url;
    }
  }
}