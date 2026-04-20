import { Response } from 'express';

export class ResponseHandler {
  // Static methods can be called directly on the class
  public static success(res: Response, data: any, message: string = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  public static created(res: Response, data: any, message: string = 'Created successfully') {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  public static error(res: Response, message: string, statusCode: number = 500, errorDetails?: any) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: errorDetails,
    });
  }
}
