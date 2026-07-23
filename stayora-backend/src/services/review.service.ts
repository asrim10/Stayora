import mongoose from "mongoose";
import { CreateReviewDTO, UpdateReviewDTO } from "../dtos/review.dto";
import { HttpError } from "../errors/http-error";
import { ReviewRepository } from "../repositories/review.repositories";
import { ReviewModel } from "../models/review.model";
import { HotelModel } from "../models/hotel.model";

let reviewRepository = new ReviewRepository();

export class ReviewService {
  async updateHotelRating(hotelId: string) {
    const avgResult = await ReviewModel.aggregate([
      { $match: { hotelId: new mongoose.Types.ObjectId(hotelId) } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);

    const newRating =
      avgResult.length > 0 ? Math.round(avgResult[0].avgRating * 10) / 10 : 0;

    await HotelModel.findByIdAndUpdate(hotelId, { rating: newRating });
  }

  async createReview(data: CreateReviewDTO) {
    const newReview = await reviewRepository.create(data);
    await this.updateHotelRating(data.hotelId);
    return newReview;
  }

  async getReviewById(id: string) {
    const review = await reviewRepository.getById(id);
    if (!review) throw new HttpError(404, "Review not found");
    return review;
  }

  async getReviewsByHotelId(hotelId: string) {
    return await reviewRepository.getByHotelId(hotelId);
  }

  async getReviewsByUserId(userId: string) {
    return await reviewRepository.getByUserId(userId);
  }

  async updateReview(id: string, updateData: UpdateReviewDTO, userId?: string) {
    const review = await reviewRepository.getById(id);
    if (!review) throw new HttpError(404, "Review not found");

    // If a userId is provided, verify ownership
    if (userId && review.userId?.toString() !== userId) {
      throw new HttpError(403, "Forbidden: you do not own this review");
    }

    // getById populates hotelId, so extract the raw _id safely
    const hotelId = (review.hotelId as any)?._id
      ? (review.hotelId as any)._id.toString()
      : review.hotelId.toString();

    const updatedReview = await reviewRepository.update(id, updateData);
    await this.updateHotelRating(hotelId);
    return updatedReview;
  }

  async deleteReview(id: string, userId?: string) {
    const review = await reviewRepository.getById(id);
    if (!review) throw new HttpError(404, "Review not found");

    // If a userId is provided, verify ownership
    if (userId && review.userId?.toString() !== userId) {
      throw new HttpError(403, "Forbidden: you do not own this review");
    }

    const hotelId = (review.hotelId as any)?._id
      ? (review.hotelId as any)._id.toString()
      : review.hotelId.toString();

    const deleted = await reviewRepository.delete(id);
    await this.updateHotelRating(hotelId);
    return deleted;
  }
}
