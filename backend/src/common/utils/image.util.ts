import sharp from 'sharp';
import { promises as fs } from 'fs';
import * as path from 'path';

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  compressionLevel?: number;
  progressive?: boolean;
  stripMetadata?: boolean;
  maxSizeInBytes?: number;
}

export class ImageUtil {
  private static readonly DEFAULT_MAX_SIZE = 1024 * 1024; 
  private static readonly MIN_QUALITY = 40;
  private static readonly QUALITY_STEP = 5;
  private static readonly INITIAL_QUALITY = 85;
  private static readonly MAX_DIMENSION = 2048;

  static async optimizeImage(
    inputBuffer: Buffer,
    options: ImageProcessingOptions = {}
  ): Promise<Buffer> {
    const {
      maxWidth = this.MAX_DIMENSION,
      maxHeight = this.MAX_DIMENSION,
      quality = this.INITIAL_QUALITY,
      format = 'avif',
      compressionLevel = 6,
      progressive = true,
      stripMetadata = true,
      maxSizeInBytes = this.DEFAULT_MAX_SIZE
    } = options;

    const imageInfo = await sharp(inputBuffer).metadata();
    const originalWidth = imageInfo.width || maxWidth;
    const originalHeight = imageInfo.height || maxHeight;

    let targetWidth = originalWidth;
    let targetHeight = originalHeight;
    let currentQuality = quality;
    let outputBuffer = await sharp(inputBuffer)
      .resize(targetWidth, targetHeight)
      .toBuffer(); 

    do {
      const scale = Math.min(0.85, Math.sqrt(maxSizeInBytes / outputBuffer.length));
      targetWidth = Math.floor(targetWidth * scale);
      targetHeight = Math.floor(targetHeight * scale);

      targetWidth = Math.min(targetWidth, maxWidth);
      targetHeight = Math.min(targetHeight, maxHeight);

      let imageProcessor = sharp(inputBuffer)
        .resize(targetWidth, targetHeight, {
          fit: 'inside',
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3
        })
        .rotate()
        .normalize()
        .sharpen({ sigma: 1, m1: 1, m2: 2, x1: 2, y2: 10, y3: 20 });

      if (stripMetadata) {
        imageProcessor = imageProcessor.withMetadata({});
      }

      imageProcessor = imageProcessor.avif({
        quality: currentQuality,
        effort: Math.min(6, compressionLevel),
        chromaSubsampling: '4:4:4',
        lossless: false
      });

      outputBuffer = await imageProcessor.toBuffer();

      if (outputBuffer.length > maxSizeInBytes) {
        currentQuality = Math.max(this.MIN_QUALITY, currentQuality - this.QUALITY_STEP);
      }
    } while (outputBuffer.length > maxSizeInBytes && currentQuality > this.MIN_QUALITY);

    return outputBuffer;
  }

  static async processUploadedFile(
    file: Express.Multer.File,
    options?: ImageProcessingOptions
  ): Promise<string> {
    try {
      const imageBuffer = await fs.readFile(file.path);
      const optimizedBuffer = await this.optimizeImage(imageBuffer, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 80,
        format: 'avif',
        compressionLevel: 6,
        progressive: true,
        stripMetadata: true,
        maxSizeInBytes: 1024 * 1024,
        ...options
      });
      
      await fs.unlink(file.path);

      const outputFormat = 'avif';
      const optimizedPath = file.path.replace(/\.[^.]+$/, `.${outputFormat}`);
      await fs.writeFile(optimizedPath, optimizedBuffer);

      return optimizedPath.replace(/\\/g, '/');
    } catch (error) {
      console.error('Image processing error:', error);
      throw error;
    }
  }
}