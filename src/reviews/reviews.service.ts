import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsService } from 'src/products/products.service';
import { ProductEntity } from 'src/products/entities/product.entity';
import { Repository } from 'typeorm';
import { ReviewEntity } from './entities/review.entity';

@Injectable()
export class ReviewsService {

  constructor(@InjectRepository(ReviewEntity) private readonly reviewRespository: Repository<ReviewEntity>,
  private readonly productService: ProductsService) {}

  async create(createReviewDto: CreateReviewDto, currentUser: UserEntity): Promise<ReviewEntity> {
    const product = await this.productService.findOne(createReviewDto.productId)
    let review = await this.findOneByUserAndProduct(currentUser.id, createReviewDto.productId);

    if(!review) {
      review = this.reviewRespository.create(createReviewDto);
      review.user = currentUser;
      review.product = product
    } else {
      review.comment = createReviewDto.comment;
      review.ratings = createReviewDto.ratings
    }

    return await this.reviewRespository.save(review)
  }

  findAll() {
    return `This action returns all reviews`;
  }

  async findAllByProduct(id: number): Promise<ReviewEntity[]> {
    const product = await this.productService.findOne(id)
    return await this.reviewRespository.find({
      where: {
        product: {id}
      },
      relations: {
        user: true,
        product: {
          category: true,
        }
      }
    })
  }

  async findOne(id: number): Promise<ReviewEntity> {
    const review = await this.reviewRespository.findOne({
      where: {
        id: id
      },
      relations: {
        user: true,
        product: {
          category: true
        }
      }
    })

    if(!review) throw new NotFoundException('Review not found')
    return review;
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  async remove(id: number) {
    const review = await this.findOne(id)
    return await this.reviewRespository.remove(review)
  }

  async findOneByUserAndProduct(userId: number, productId: number) {
    return await this.reviewRespository.findOne({
      where: { 
        user: {
          id: userId
        },
        product: {
          id: productId
        }
       },
      relations: {
        user: true,
        product: {
          category: true
        }
      }
    })
  }
}
