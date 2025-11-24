/**
 * QR Code Service
 * 
 * Implements IQrCodeService interface
 * Following ISP: Small, focused interface implementation
 */

import { IQrCodeService } from '@rpsfull-platform/contracts';
import * as QRCode from 'qrcode';

export class QrCodeService implements IQrCodeService {
  async generateQRCode(
    data: string,
    options?: {
      width?: number;
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    }
  ): Promise<string> {
    const width = options?.width || 300;
    const errorCorrectionLevel = options?.errorCorrectionLevel || 'M';

    try {
      const dataUrl = await QRCode.toDataURL(data, {
        width,
        errorCorrectionLevel,
        type: 'image/png',
      });
      return dataUrl;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateQRCodeSVG(
    data: string,
    options?: {
      size?: number;
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    }
  ): Promise<string> {
    const size = options?.size || 300;
    const errorCorrectionLevel = options?.errorCorrectionLevel || 'M';

    try {
      const svg = await QRCode.toString(data, {
        type: 'svg',
        width: size,
        errorCorrectionLevel,
      });
      return svg;
    } catch (error) {
      throw new Error(`Failed to generate QR code SVG: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

