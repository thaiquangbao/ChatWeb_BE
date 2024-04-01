import { Injectable } from '@nestjs/common';
import { CloudinaryResponse } from './cloudinary-response';
import { v2 as cloudinary } from 'cloudinary';
@Injectable()
export class CloudinaryService {
  uploadFileFromBuffer(fileBuffer: Buffer): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: 'image', folder: 'Zen_Chat' }, // Thêm tùy chọn folder
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          },
        )
        .end(fileBuffer);
    });
  }
  deleteImage(publicId: string): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
    });
  }
  async deleteAllImg(imgs: string[]) {
    return imgs.forEach((e) => {
      cloudinary.uploader.destroy(e);
    });
  }
}
