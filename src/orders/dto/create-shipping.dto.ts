import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateShippingDto {
    
    @IsNotEmpty({message: 'Phone cannot be empty'})
    @IsString({message: 'phone should be string'})
    phone: string;

    @IsOptional()
    @IsString({message: 'name should be string'})
    name: string;

    @IsNotEmpty({message: 'address cannot be empty'})
    @IsString({message: 'address should be string'})
    address: string;

    @IsNotEmpty({message: 'city cannot be empty'})
    @IsString({message: 'city should be string'})
    city: string;

    @IsNotEmpty({message: 'postcode cannot be empty'})
    @IsString({message: 'postcode should be string'})
    postCode: string;

    @IsNotEmpty({message: 'state cannot be empty'})
    @IsString({message: 'state should be string'})
    state: string;

    @IsNotEmpty({message: 'country cannot be empty'})
    @IsString({message: 'country should be string'})
    country: string;
}