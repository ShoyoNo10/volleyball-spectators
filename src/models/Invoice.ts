// import mongoose from "mongoose";

// const InvoiceSchema = new mongoose.Schema({
//   invoiceId: String,
//   deviceId: String,
//   months: Number,
// });

// export default mongoose.models.Invoice ||
//   mongoose.model("Invoice", InvoiceSchema);

import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  invoiceId: String,
  userId: String,   // 🔥 ADD
  months: Number,
});

export default mongoose.models.Invoice ||
  mongoose.model("Invoice", InvoiceSchema);

