export interface IProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export interface IProductRepository {
  findById(id: number): Promise<IProduct | null>;
  findAll(): Promise<IProduct[]>;
  create(product: Partial<IProduct>): Promise<IProduct>;
  update(id: number, product: Partial<IProduct>): Promise<IProduct>;
  delete(id: number): Promise<boolean>;
}
