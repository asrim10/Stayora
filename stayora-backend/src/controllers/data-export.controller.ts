import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { BookingRepository } from "../repositories/booking.repositories";
import { ReviewRepository } from "../repositories/review.repositories";
import { FavouriteRepository } from "../repositories/favourite.repositories";
import { NotificationRepository } from "../repositories/notification.repositories";
import { AuditLogService } from "../services/audit-log.service";

const userService = new UserService();
const bookingRepo = new BookingRepository();
const reviewRepo = new ReviewRepository();
const favouriteRepo = new FavouriteRepository();
const notificationRepo = new NotificationRepository();
const auditLogService = new AuditLogService();

export class DataExportController {
  /**
   * GET /api/auth/export-data
   * Exports the authenticated user's data as a downloadable JSON file.
   * Supports ?format=csv for CSV download.
   */
  async exportUserData(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const format = (req.query.format as string)?.toLowerCase() || "json";

      // Gather user profile
      const user = await userService.getUserById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Don't expose sensitive data — strip password hash and history
      const userProfile = {
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        authProvider: user.authProvider,
        mfaEnabled: user.mfaEnabled,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      // Gather user's bookings
      const bookings = await bookingRepo.getByUserId(userId);

      // Gather user's reviews
      const reviews = await reviewRepo.getByUserId(userId);

      // Gather user's favourites
      const favourites = await favouriteRepo.getByUserId(userId);

      // Gather user's notifications (last 50)
      const notifications = await notificationRepo.getByUserId(userId);

      // Gather user's audit logs (last 100)
      const auditLogs = await auditLogService.getByUser(userId, 1, 100);

      const exportData = {
        exportedAt: new Date().toISOString(),
        user: userProfile,
        bookings: bookings.map((b) => ({
          id: b._id,
          hotel: (b as any).hotelId?.name || "Unknown",
        checkIn: (b as any).checkInDate,
        checkOut: (b as any).checkOutDate,
        status: (b as any).status,
        paymentStatus: (b as any).paymentStatus,
        totalAmount: (b as any).totalPrice,
          createdAt: b.createdAt,
        })),
        reviews: reviews.map((r) => ({
          id: r._id,
          hotel: (r as any).hotelId?.name || "Unknown",
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
        })),
        favourites: favourites.map((f) => ({
          id: f._id,
          hotel: (f as any).hotelId?.name || "Unknown",
          createdAt: f.createdAt,
        })),
        notifications: notifications.map((n) => ({
          id: n._id,
          title: n.title,
          message: n.message,
          isRead: n.isRead,
          createdAt: n.createdAt,
        })),
        activityLog: (auditLogs as any).logs?.map((l: any) => ({
          action: l.action,
          details: l.details,
          ip: l.ip,
          timestamp: l.timestamp,
        })),
      };

      // Audit: data export (non-blocking)
      try {
        await auditLogService.log(
          userId,
          "data_export",
          `User exported their data in ${format.toUpperCase()} format`,
          req,
        );
      } catch { /* audit failure should not block export */ }

      // Set appropriate content type and disposition for download
      if (format === "csv") {
        const csv = this.convertToCSV(exportData);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="stayora-data-${userId.slice(-8)}.csv"`,
        );
        return res.status(200).send(csv);
      }

      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="stayora-data-${userId.slice(-8)}.json"`,
      );
      return res.status(200).json(exportData);
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to export data",
      });
    }
  }

  /**
   * Convert the export data object to CSV format.
   * Flattens nested arrays into separate CSV sections.
   */
  private convertToCSV(data: any): string {
    const lines: string[] = [];

    // Header
    lines.push(`# Stayora Data Export — ${data.exportedAt}`);
    lines.push("");

    // User profile
    lines.push("--- USER PROFILE ---");
    lines.push("field,value");
    for (const [key, value] of Object.entries(data.user)) {
      lines.push(`${key},${JSON.stringify(value)}`);
    }
    lines.push("");

    // Bookings
    lines.push("--- BOOKINGS ---");
    if (data.bookings.length > 0) {
      const headers = Object.keys(data.bookings[0]);
      lines.push(headers.join(","));
      for (const booking of data.bookings) {
        lines.push(
          headers.map((h) => JSON.stringify(booking[h] ?? "")).join(","),
        );
      }
    } else {
      lines.push("No bookings");
    }
    lines.push("");

    // Reviews
    lines.push("--- REVIEWS ---");
    if (data.reviews.length > 0) {
      const headers = Object.keys(data.reviews[0]);
      lines.push(headers.join(","));
      for (const review of data.reviews) {
        lines.push(
          headers.map((h) => JSON.stringify(review[h] ?? "")).join(","),
        );
      }
    } else {
      lines.push("No reviews");
    }
    lines.push("");

    // Favourites
    lines.push("--- FAVOURITES ---");
    if (data.favourites.length > 0) {
      const headers = Object.keys(data.favourites[0]);
      lines.push(headers.join(","));
      for (const fav of data.favourites) {
        lines.push(
          headers.map((h) => JSON.stringify(fav[h] ?? "")).join(","),
        );
      }
    } else {
      lines.push("No favourites");
    }
    lines.push("");

    // Activity log
    lines.push("--- ACTIVITY LOG ---");
    if (data.activityLog.length > 0) {
      const headers = Object.keys(data.activityLog[0]);
      lines.push(headers.join(","));
      for (const log of data.activityLog) {
        lines.push(
          headers.map((h) => JSON.stringify(log[h] ?? "")).join(","),
        );
      }
    } else {
      lines.push("No activity log entries");
    }

    return lines.join("\n");
  }
}
