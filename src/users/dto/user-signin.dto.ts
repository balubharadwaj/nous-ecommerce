import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';

export class UserSignInDto {

    @IsNotEmpty({message: 'email can not be empy'})
    @IsEmail({}, {message: 'please provide a valid email'})
    email: string;

    @IsNotEmpty({message: 'Password should not be empty'})
    @MinLength(5, {message: 'Password should be minimum 5'})
    password: string
}