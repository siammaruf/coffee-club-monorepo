import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
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
}