import { IsArray, IsNotEmpty, IsNumber, IsPositive, IsString, Min } from "class-validator";

export class CreateProductDto {
    @IsNotEmpty({message: 'title can not be empty'})
    @IsString({message: 'title should be string'})
    title: string;

    @IsNotEmpty({message: 'description cannot be empty'})
    @IsString({message: 'title can not be empty'})
    description: string;

    @IsNotEmpty({message: 'price should not be empty'})
    @IsNumber({maxDecimalPlaces: 2}, {message: 'price should be number'})
    @IsPositive({message: 'price should be positive'})
    price: number;

    @IsNotEmpty({message: 'stock should not be empty'})
    @IsNumber({}, {message:'should be number'})
    @Min(0, {message: 'stock can not be empty'})
    stock: number;

    @IsNotEmpty({message: 'images should not be empty'})
    @IsArray({message: 'images should be an array'})
    images: string[];

    @IsNotEmpty({message: 'category should not be empty'})
    @IsNumber({}, {message:'category should be number'})
    categoryId: number;

}
