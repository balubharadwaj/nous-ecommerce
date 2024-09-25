import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderEntity } from "./order.entity";
import { UserEntity } from "src/users/entities/user.entity";

@Entity({name: "shippings"})
export class ShippingEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    phone: string;

    @Column()
    address: string;

    @Column()
    city: string;

    @Column()
    postCode: string;

    @Column()
    state: string

    @Column()
    country: string;

    @OneToOne(() => OrderEntity, order => order.shippingAddress)
    order: OrderEntity

}