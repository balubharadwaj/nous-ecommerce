import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { UserSignInDto } from "./user-signin.dto";

export class UserSignUpDto extends UserSignInDto {

    @IsNotEmpty({message: 'Name cant be null'})
    @IsString({message: 'Name should be string'})
    name: string;

}