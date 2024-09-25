import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { OrderStatus } from 'src/orders/enums/order-status.enum';
import dataSource from 'db/data-source';

@Injectable()
export class ProductsService {

  constructor(@InjectRepository(ProductEntity) private readonly productRespository: Repository<ProductEntity>,
private readonly categoryService: CategoriesService){}

  async create(createProductDto: CreateProductDto, currentUser: UserEntity): Promise<ProductEntity> {
    const category = await this.categoryService.findOne(+createProductDto.categoryId);
    const product = this.productRespository.create(createProductDto);

    product.category = category;
    product.addedBy = currentUser

    return await this.productRespository.save(product)
  }

  async findAll(query: any): Promise<any> {

    let filteredTotalProducts: number;
    let limit: number;

    if(!query.limit) {
      limit = 4
    } else {
      limit = query.limit
    }

    const queryBuilder = dataSource.getRepository(ProductEntity)
    .createQueryBuilder('product')
    .leftJoinAndSelect('product.category', 'category')
    .leftJoin('product.reviews', 'review')
    .addSelect([
      'COUNT(review.id) AS reviewCount',
      'AVG(review.ratings)::numeric(10,2) AS avgRating'
    ])
    .groupBy('product.id,catgeory.id');

    const totalProducts = await queryBuilder.getCount();

    return totalProducts;
  }

  async findOne(id: number): Promise<ProductEntity> {
    const product = await this.productRespository.findOne({
      where: {id: id},
      relations: {
        addedBy: true,
        category: true
      },
      select: {
        addedBy: {
          id: true,
          name: true,
          email: true
        },
        category: {
          id: true,
          title: true
        }
      }
    });

    if(!product) throw new NotFoundException('Product not found');

    return product
  }

  async update(id: number, updateProductDto:Partial<UpdateProductDto>, currentUser: UserEntity): Promise<ProductEntity> {

    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);

    product.addedBy = currentUser;

    if(updateProductDto.categoryId) {
      const category = await this.categoryService.findOne(
        +updateProductDto.categoryId,
      );
      product.category = category;
    }

    return await this.productRespository.save(product);
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  async updateStock(id: number, stock: number, status: string) {
    let product = await this.findOne(id);

    if(status === OrderStatus.DELIVERED) {
      product.stock -= stock;
    } else {
      product.stock += stock;
    }

    product = await this.productRespository.save(product)

    return product
  }
}
