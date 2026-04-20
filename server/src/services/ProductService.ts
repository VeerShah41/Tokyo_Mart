import { IProductRepository, IProduct } from '../interfaces/IProductRepository';

export class ProductService {
  private repository: IProductRepository;

  // Dependency Inversion: We inject the repository interface instead of hardcoding
  constructor(repository: IProductRepository) {
    this.repository = repository;
  }

  public async getAllProducts(): Promise<IProduct[]> {
    return await this.repository.findAll();
  }

  public async getProductById(id: number): Promise<IProduct | null> {
    if (id <= 0) {
      throw new Error("Invalid Product ID");
    }
    return await this.repository.findById(id);
  }

  public async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
    if (!productData.name || !productData.price) {
      throw new Error("Missing required product fields");
    }
    return await this.repository.create(productData);
  }
}
