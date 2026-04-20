import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../utils/ResponseHandler';

/**
 * Abstract class representing a generic controller.
 * Enforces common contract for request execution with built-in try-catch abstraction.
 */
export abstract class BaseController {
  
  /**
   * Protected method to handle generic execution securely.
   * Applying the Template Method pattern inside the controller.
   */
  protected abstract executeImpl(req: Request, res: Response, next: NextFunction): Promise<void | any>;

  /**
   * Public method to act as the route handler. Wraps the execution in a try-catch blocks.
   */
  public execute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.executeImpl(req, res, next);
    } catch (error: any) {
      console.error(`[Controller Error]: ${error.message}`);
      ResponseHandler.error(res, 'Internal Server Error', 500, error.message);
    }
  }

  // Common utilities available to inherited controllers
  protected sendSuccess(res: Response, data: any, message?: string) {
    ResponseHandler.success(res, data, message);
  }

  protected sendCreated(res: Response, data: any, message?: string) {
    ResponseHandler.created(res, data, message);
  }

  protected sendError(res: Response, message: string, statusCode: number = 400) {
    ResponseHandler.error(res, message, statusCode);
  }
}
