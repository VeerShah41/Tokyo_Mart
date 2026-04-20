import { IProductRepository, IProduct } from '../interfaces/IProductRepository';
import { dbClient } from '../core/Database';

export class ProductRepository implements IProductRepository {
  public async findById(id: number): Promise<IProduct | null> {
    return await dbClient.product.findUnique({
      where: { id }
    }) as IProduct | null;
  }

  public async findAll(): Promise<IProduct[]> {
    return await dbClient.product.findMany() as IProduct[];
  }

  public async create(product: Partial<IProduct>): Promise<IProduct> {
    return await dbClient.product.create({
      data: product as any
    }) as IProduct;
  }

  public async update(id: number, product: Partial<IProduct>): Promise<IProduct> {
    return await dbClient.product.update({
      where: { id },
      data: product as any
    }) as IProduct;
  }

  public async delete(id: number): Promise<boolean> {
    try {
      await dbClient.product.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
