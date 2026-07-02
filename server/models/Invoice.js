const mongoose = require("mongoose");
const { Schema } = mongoose;

const invoiceSchema = new Schema(
  {
    userId: { type: String, required: true },
    date: { type: Date, default: Date.now },
    pdfUrl: { type: String, required: true },
    template: {
      _id: { type: Schema.Types.ObjectId, ref: "Template" },
      company: {
        name: String,
        logo: String,
        address: String,
      },
    },
    invoiceDetails: {
      type: { type: String, default: 'invoice' },
      bookingReference: String,
      passengerName: [String],
      passengers: [{
        passportNumber: String,
        nationality: String,
        dob: String,
        gender: String
      }]
    },
    priceDetails: {
      totalAmount: String,
      paymentMethod: String,
      transactionId: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
