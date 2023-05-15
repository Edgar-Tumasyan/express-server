import { v4 as UUIDV4 } from "uuid";
import { Model, Column, Table, IsUUID, PrimaryKey, Default, BelongsTo, ForeignKey } from "sequelize-typescript";

import { User } from "./User";

@Table({ tableName: "organization" })
export class Organization extends Model<Organization> {
  @IsUUID(4)
  @PrimaryKey
  @Default(UUIDV4)
  @Column
  id!: string;

  @Column
  name!: string;

  @Column
  label!: string;

  @Column
  orgInfoId!: string;

  @Column
  description!: string;

  @ForeignKey(() => User)
  @Column
  ownerId!: string;

  @BelongsTo(() => User)
  user!: ReturnType<() => User>;
}
