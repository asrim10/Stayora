import axios from "axios";
import { InitiatePaymentDtoType } from "../dtos/payment.dto";
import { PaymentRepository } from "../repositories/payment.repositories";
import { BookingRepository } from "../repositories/booking.repositories";
import { HttpError } from "../errors/http-error";

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY!;
const KHALTI_BASE_URL = "https://dev.khalti.com/api/v2";

const paymentRepo = new PaymentRepository();
const bookingRepo = new BookingRepository();

export class PaymentService {
  async initiatePayment(payload: InitiatePaymentDtoType, userId?: string) {
    const { bookingId, totalPrice, fullName, email } = payload;

    // Verify booking exists and belongs to the authenticated user
    const booking = await bookingRepo.getById(bookingId);
    if (!booking) {
      throw new HttpError(404, "Booking not found");
    }
    if (userId && booking.userId?.toString() !== userId) {
      throw new HttpError(403, "Forbidden: you do not own this booking");
    }

    const response = await axios.post(
      `${KHALTI_BASE_URL}/epayment/initiate/`,
      {
        return_url: `${process.env.CLIENT_URL}/user/booking/verify`,
        website_url: process.env.CLIENT_URL,
        amount: totalPrice * 100, // NPR to paisa
        purchase_order_id: bookingId,
        purchase_order_name: `Hotel Booking - ${bookingId}`,
        customer_info: { name: fullName, email },
      },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const { pidx, payment_url } = response.data;

    // Save pidx to booking
    await paymentRepo.savePidx(bookingId, pidx);

    return { pidx, payment_url };
  }

  async verifyPayment(pidx: string, userId?: string) {
    // Verify the booking associated with this pidx belongs to the authenticated user
    const existingBooking = await paymentRepo.getByPidx(pidx);
    if (!existingBooking) {
      throw new HttpError(404, "Payment record not found");
    }
    if (userId && existingBooking.userId?.toString() !== userId) {
      throw new HttpError(403, "Forbidden: you do not own this booking");
    }

    const response = await axios.post(
      `${KHALTI_BASE_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Khalti lookup response:", response.data);

    const { status, transaction_id, purchase_order_id, total_amount } =
      response.data;

    // ← case insensitive check
    if (status?.toLowerCase() === "completed") {
      const booking = await paymentRepo.confirmPayment(pidx, transaction_id);
      return {
        success: true,
        transactionId: transaction_id,
        bookingId: purchase_order_id,
        amount: total_amount / 100,
        booking,
      };
    }

    await paymentRepo.failPayment(pidx);
    return { success: false, status };
  }
}
