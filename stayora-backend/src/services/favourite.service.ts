import { CreateFavouriteDTO } from "../dtos/favourite.dto";
import { HttpError } from "../errors/http-error";
import { FavouriteRepository } from "../repositories/favourite.repositories";

let favouriteRepository = new FavouriteRepository();

export class FavouriteService {
  async addFavourite(data: CreateFavouriteDTO, userId: string) {
    const existing = await favouriteRepository.getByUserId(userId);

    if (existing.find((fav) => fav.hotelId.toString() === data.hotelId)) {
      throw new HttpError(400, "Hotel already in favourites");
    }

    // Merge userId
    const newFavourite = await favouriteRepository.add({ ...data, userId });
    return newFavourite;
  }

  async removeFavourite(favouriteId: string, userId?: string) {
    const favourite = await favouriteRepository.getById(favouriteId);

    if (!favourite) {
      throw new HttpError(404, "Favourite not found");
    }

    // If a userId is provided, verify ownership
    if (userId && favourite.userId?.toString() !== userId) {
      throw new HttpError(403, "Forbidden: you do not own this favourite");
    }

    const deleted = await favouriteRepository.remove(favouriteId);
    return deleted;
  }

  async getFavouriteById(favouriteId: string, userId?: string) {
    const favourite = await favouriteRepository.getById(favouriteId);

    if (!favourite) {
      throw new HttpError(404, "Favourite not found");
    }

    // If a userId is provided, verify ownership
    if (userId && favourite.userId?.toString() !== userId) {
      throw new HttpError(403, "Forbidden: you do not own this favourite");
    }

    return favourite;
  }

  async getFavouritesByUserId(userId: string) {
    const favourites = await favouriteRepository.getByUserId(userId);
    return favourites;
  }

  async getAllFavourites() {
    const favourites = await favouriteRepository.getAll();
    return favourites;
  }
}
