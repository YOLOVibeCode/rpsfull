/**
 * QR Code Service Interface
 * 
 * ISP: Small, focused interface for QR code generation only
 */

/**
 * QR code service interface
 * Focused only on QR code generation operations
 */
export interface IQrCodeService {
  /**
   * Generate QR code as base64 data URL (PNG image)
   */
  generateQRCode(data: string, options?: {
    width?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }): Promise<string>;

  /**
   * Generate QR code as SVG string
   */
  generateQRCodeSVG(data: string, options?: {
    size?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }): Promise<string>;
}

