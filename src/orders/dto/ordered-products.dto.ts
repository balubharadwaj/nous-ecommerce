import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class OrderedProductsDto {

    @IsNotEmpty({message: 'address cannot be empty'})
    id: number;

    @IsNumber({maxDecimalPlaces: 2}, {message: 'price should be number'})
    @IsPositive({message: 'prise cannot be negitive'})
    product_unit_price: number;

    @IsNumber({}, {message: 'product_quantity should be number'})
    @IsPositive({message: 'product_quantity cannot be negitive'})
    product_quantity: number;
}