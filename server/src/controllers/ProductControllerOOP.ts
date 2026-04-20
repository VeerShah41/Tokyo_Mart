import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/BaseController';
import { ProductService } from '../services/ProductService';

export class ProductController extends BaseController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    super();
    this.productService = productService;
  }

  // Implementing the abstract executeImpl method for fetching all products
  protected executeImpl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Example logic using our service
    const products = await this.productService.getAllProducts();
    this.sendSuccess(res, products, "Products retrieved successfully");
  }

  // Another route handler utilizing try-catch abstraction from BaseController
  public executeGetById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const product = await this.productService.getProductById(id);
      if (!product) {
        this.sendError(res, "Product not found", 404);
        return;
      }
      this.sendSuccess(res, product, "Product retrieved successfully");
    } catch (error: any) {
      this.sendError(res, error.message, 500);
    }
  }
}
