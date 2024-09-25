import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSignUpDto } from './dto/user-signup.dto';
import { UserSignInDto } from './dto/user-signin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken'

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(UserEntity)
    private usersRespository: Repository<UserEntity>,
  ) {}

  async signup(body: UserSignUpDto): Promise<UserEntity> {
    console.log('body', body);
    const userExist = await this.findUserByEmail(body.email)
    
    if(userExist) throw new BadRequestException('Email is not available')

    body.password = await hash(body.password, 10)
    let user = this.usersRespository.create(body);

    user = await this.usersRespository.save(user);

    delete user.password

    return user;
  }

  async signin(userSignInDto: UserSignInDto) {

    const userExist = await this.usersRespository.createQueryBuilder('users').addSelect('users.password').where('users.email=:email', {email: userSignInDto.email}).getOne();

    if(!userExist) throw new BadRequestException('Email is not available')

    const matchPassword = await compare(userSignInDto.password, userExist.password);
    if(!matchPassword) throw new BadRequestException('Bad credentials')

    delete userExist.password
    return userExist;

  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    return await this.usersRespository.find();
  }

  async findOne(id: number) {
    return await this.usersRespository.findOneBy({id})
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findUserByEmail(email: string) {
    return await this.usersRespository.findOneBy({email});
  }

  async accessToken(user: UserEntity) {
    return sign({id: user.id, email: user.email}, process.env.ACSESS_TOKEN_SECRET_KEY, {expiresIn: process.env.ACSESS_TOKEN_SECRET_EXPIRE})

  }
}
