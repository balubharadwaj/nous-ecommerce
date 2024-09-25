import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateReviewDto {

    @IsNotEmpty({message: "product should not be empty"})
    @IsNumber({}, {message: 'Product id should be number'})
    productId: number;

    @IsNotEmpty({message: "product rating should not be empty"})
    @IsNumber({}, {message: 'Product rating should be number'})
    ratings: number;

    @IsNotEmpty({message: "commentshould not be empty"})
    @IsString({message: 'Comment should be string'})
    comment: string;
}
