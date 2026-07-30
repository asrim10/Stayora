import { CreateHotelDTO, UpdateHotelDTO } from "../../dtos/hotel.dto";
import { HotelRepository } from "../../repositories/hotel.repositories";
import { HttpError } from "../../errors/http-error";
import { geocodeAddress } from "../../config/geocode";

let hotelRepository = new HotelRepository();

export class AdminHotelService {
  async createHotel(data: CreateHotelDTO) {
    let geocodingWarning: string | null = null;

    if (!data.coordinates) {
      const result = await geocodeAddress(data.address, data.city, data.country);
      if (result.coordinates) {
        data.coordinates = result.coordinates;
      }
      geocodingWarning = result.warning;
    }

    const newHotel = await hotelRepository.create(data);
    return { hotel: newHotel, geocodingWarning };
  }

  async getAllHotels() {
    const hotels = await hotelRepository.getAll();
    return hotels;
  }

  async deleteHotel(id: string) {
    const hotel = await hotelRepository.getById(id);
    if (!hotel) {
      throw new HttpError(404, "Hotel not found");
    }
    const deleted = await hotelRepository.delete(id);
    return deleted;
  }

  async updateHotel(id: string, updateData: UpdateHotelDTO) {
    const hotel = await hotelRepository.getById(id);
    if (!hotel) {
      throw new HttpError(404, "Hotel not found");
    }

    let geocodingWarning: string | null = null;

    const locationChanged =
      updateData.address || updateData.city || updateData.country;
    if (locationChanged && !updateData.coordinates) {
      const result = await geocodeAddress(
        updateData.address ?? hotel.address,
        updateData.city ?? hotel.city,
        updateData.country ?? hotel.country,
      );
      if (result.coordinates) {
        updateData.coordinates = result.coordinates;
      }
      geocodingWarning = result.warning;
    }

    const updatedHotel = await hotelRepository.update(id, updateData);
    return { hotel: updatedHotel, geocodingWarning };
  }

  async getHotelById(id: string) {
    const hotel = await hotelRepository.getById(id);
    if (!hotel) {
      throw new HttpError(404, "Hotel not found");
    }
    return hotel;
  }
}
