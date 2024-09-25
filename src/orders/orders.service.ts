import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrdersProductsEntity } from './entities/orders-product.entity';
import { ShippingEntity } from './entities/shipping.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/products.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrdersService {

  constructor(@InjectRepository(OrderEntity) private readonly orderRespository: Repository<OrderEntity>, 
  @InjectRepository(OrdersProductsEntity) private readonly opRepository: Repository<OrdersProductsEntity>,
  private readonly productService: ProductsService) 
  {}

  async create(createOrderDto: CreateOrderDto, currentUser: UserEntity): Promise<OrderEntity> {
    const shippingEntity = new ShippingEntity();

    Object.assign(shippingEntity, createOrderDto.shippingAddress);

    const orderEntity = new OrderEntity();
    orderEntity.shippingAddress = shippingEntity;
    orderEntity.user = currentUser;

    const order = await this.orderRespository.save(orderEntity);

    let opEntity: {
      order: OrderEntity;
      product: ProductEntity;
      product_quantity: number;
      product_unit_price: number;
    }[] = [];

    for(let i = 0; i < createOrderDto.orderedProducts.length; i++) {
      const orderId = order;
      const product = await this.productService.findOne(createOrderDto.orderedProducts[i].id);
      const product_quantity = createOrderDto.orderedProducts[i].product_quantity;
      const product_unit_price = createOrderDto.orderedProducts[i].product_unit_price;
      opEntity.push({order, product, product_quantity, product_unit_price})
    }

    const op = await this.opRepository.createQueryBuilder()
    .insert()
    .into(OrdersProductsEntity)
    .values(opEntity)
    .execute()
    return await this.findOne(order.id);
  }

  async findAll(): Promise<OrderEntity[]> {
    return await this.orderRespository.find({
      relations: {
        shippingAddress: true,
        user: true,
        products: {
          product: true
        }
      }
    })
  }

  async findOne(id: number): Promise<OrderEntity> {
    return await this.orderRespository.findOne({
      where: {
        id: id
      },
      relations: {
        shippingAddress: true,
        user: true,
        products: {
          product: true
        }
      }
    });
  }

  async update(id: number, updateOrderStatusDto: UpdateOrderStatusDto, currentUser: UserEntity) {

    let order = await this.findOne(id);

    if(!order) throw new NotFoundException('Unable to find the order')

    if(order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED)
      throw new BadRequestException(`Order already ${order.status}`);

    if(order.status === OrderStatus.PROCESSING && updateOrderStatusDto.status != OrderStatus.SHIPPED)
      throw new BadRequestException(`Delivery before shipped!!`);

    if(updateOrderStatusDto.status === OrderStatus.PROCESSING && order.status === OrderStatus.SHIPPED)
      return order;

    if(updateOrderStatusDto.status === OrderStatus.SHIPPED) {
      order.shippedAt = new Date();
    }

    if(updateOrderStatusDto.status === OrderStatus.DELIVERED)
      order.deliveredAt = new Date();

    order.status = updateOrderStatusDto.status;
    order.updatedBy = currentUser;

    order = await this.orderRespository.save(order)

    if(updateOrderStatusDto.status === OrderStatus.DELIVERED) {
      await this.stockUpdate(order, OrderStatus.DELIVERED)
    }

    return order;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  async stockUpdate(order: OrderEntity, status: string) {
    for(const op of order.products) {
      await this.productService.updateStock(op.product.id, op.product_quantity, status)
    }
  }

  async cancelled(id: string, currentUser: UserEntity) {
    let order = await this.findOne(+id);
    if(!order) throw new NotFoundException('Order Not Found')
    
    if(order.status === OrderStatus.CANCELLED) return order;

    order.status = OrderStatus.CANCELLED;
    order.updatedBy = currentUser;
    order = await this.orderRespository.save(order);

    await this.stockUpdate(order, OrderStatus.CANCELLED)
     
    return order
  }
}
