import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Req,
  UseGuards,
} from "@nestjs/common";

import { AuthGuard } from "@nestjs/passport";
import { AddToFavService } from "./favorites.service";

@UseGuards(AuthGuard("jwt"))
@Controller("favorites")
export class FavoritesController {
  constructor(private readonly favoritesService: AddToFavService) {}

  @Post(":propertyId")
  addFavorite(@Param("propertyId") propertyId: string, @Req() req) {
    const userId = req.user.userId;
    return this.favoritesService.addFavorite(userId, propertyId);
  }

  @Delete(":propertyId")
  async removeFavorite(@Param("propertyId") propertyId: string, @Req() req) {
    const userId = req.user.userId;
    const deleted = await this.favoritesService.removeFavorite(
      userId,
      propertyId,
    );
    return { message: "Favorite removed", deleted };
  }

  @Get()
  getFavorites(@Req() req) {
    const userId = req.user.userId;
    return this.favoritesService.getUserFavorites(userId);
  }
}
