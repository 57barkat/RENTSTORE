import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddToFavService } from './favorites.service';
import { AddToFav, AddToFavSchema } from './favorite.entity';
import { User, UserSchema } from '../user/user.entity';
import { Property, PropertySchema } from '../property/property.schema';
import { FavoritesController } from './favorites.controller';
 

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AddToFav.name, schema: AddToFavSchema },
      { name: User.name, schema: UserSchema },
      { name: Property.name, schema: PropertySchema },
    ]),
  ],
  controllers: [FavoritesController],
  providers: [AddToFavService],
})
export class AddToFavModule {}
