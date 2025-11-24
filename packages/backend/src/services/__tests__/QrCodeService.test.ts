/**
 * QR Code Service Tests
 * 
 * Tests for QrCodeService following TDD principles
 */

import { QrCodeService } from '../QrCodeService';
import * as QRCode from 'qrcode';

jest.mock('qrcode');

describe('QrCodeService', () => {
  let qrCodeService: QrCodeService;

  beforeEach(() => {
    qrCodeService = new QrCodeService();
    jest.clearAllMocks();
  });

  describe('generateQRCode', () => {
    it('should generate QR code as data URL', async () => {
      const mockDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      (QRCode.toDataURL as jest.Mock).mockResolvedValue(mockDataUrl);

      const result = await qrCodeService.generateQRCode('https://example.com');

      expect(result).toBe(mockDataUrl);
      expect(QRCode.toDataURL).toHaveBeenCalledWith('https://example.com', {
        width: 300,
        errorCorrectionLevel: 'M',
        type: 'image/png',
      });
    });

    it('should use custom width when provided', async () => {
      const mockDataUrl = 'data:image/png;base64,test';
      (QRCode.toDataURL as jest.Mock).mockResolvedValue(mockDataUrl);

      await qrCodeService.generateQRCode('https://example.com', { width: 500 });

      expect(QRCode.toDataURL).toHaveBeenCalledWith('https://example.com', {
        width: 500,
        errorCorrectionLevel: 'M',
        type: 'image/png',
      });
    });

    it('should use custom error correction level when provided', async () => {
      const mockDataUrl = 'data:image/png;base64,test';
      (QRCode.toDataURL as jest.Mock).mockResolvedValue(mockDataUrl);

      await qrCodeService.generateQRCode('https://example.com', { errorCorrectionLevel: 'H' });

      expect(QRCode.toDataURL).toHaveBeenCalledWith('https://example.com', {
        width: 300,
        errorCorrectionLevel: 'H',
        type: 'image/png',
      });
    });

    it('should throw error when QR code generation fails', async () => {
      const error = new Error('QR code generation failed');
      (QRCode.toDataURL as jest.Mock).mockRejectedValue(error);

      await expect(qrCodeService.generateQRCode('invalid')).rejects.toThrow(
        'Failed to generate QR code: QR code generation failed'
      );
    });
  });

  describe('generateQRCodeSVG', () => {
    it('should generate QR code as SVG string', async () => {
      const mockSVG = '<svg>...</svg>';
      (QRCode.toString as jest.Mock).mockResolvedValue(mockSVG);

      const result = await qrCodeService.generateQRCodeSVG('https://example.com');

      expect(result).toBe(mockSVG);
      expect(QRCode.toString).toHaveBeenCalledWith('https://example.com', {
        type: 'svg',
        width: 300,
        errorCorrectionLevel: 'M',
      });
    });

    it('should use custom size when provided', async () => {
      const mockSVG = '<svg>...</svg>';
      (QRCode.toString as jest.Mock).mockResolvedValue(mockSVG);

      await qrCodeService.generateQRCodeSVG('https://example.com', { size: 500 });

      expect(QRCode.toString).toHaveBeenCalledWith('https://example.com', {
        type: 'svg',
        width: 500,
        errorCorrectionLevel: 'M',
      });
    });

    it('should throw error when SVG generation fails', async () => {
      const error = new Error('SVG generation failed');
      (QRCode.toString as jest.Mock).mockRejectedValue(error);

      await expect(qrCodeService.generateQRCodeSVG('invalid')).rejects.toThrow(
        'Failed to generate QR code SVG: SVG generation failed'
      );
    });
  });
});

