import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Access from "@/src/models/Access";
import Invoice from "@/src/models/Invoice";
import { getQpayToken } from "@/src/lib/qpay";

export async function GET(req: Request) {
  try {
    console.log("🔥 CALLBACK HIT");

    await connectDB();

    const { searchParams } = new URL(req.url);
    const payment_id = searchParams.get("qpay_payment_id");

    console.log("PAYMENT ID:", payment_id);

    if (!payment_id) return new NextResponse("SUCCESS");

    const token = await getQpayToken();

    // 🔥 ЧУХАЛ: invoice_id-аар шалгана
    const invoice = await Invoice.findOne().sort({ _id: -1 });

    if (!invoice) return new NextResponse("SUCCESS");

    const checkRes = await fetch(
      "https://merchant.qpay.mn/v2/payment/check",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          object_type: "INVOICE",
          object_id: invoice.invoiceId,
        }),
      }
    );

    const data = await checkRes.json();
    console.log("PAYMENT DATA:", data);

    if (!data.rows?.length) return new NextResponse("SUCCESS");

    const row = data.rows[0];

    if (row.payment_status !== "PAID") {
      return new NextResponse("SUCCESS");
    }

    const expires = new Date();
    expires.setMonth(expires.getMonth() + invoice.months);

    await Access.findOneAndUpdate(
      { deviceId: invoice.deviceId },
      { expiresAt: expires },
      { upsert: true }
    );

    console.log("✅ ACCESS UNLOCKED");

    return new NextResponse("SUCCESS");
  } catch (err) {
    console.log("❌ CALLBACK ERROR:", err);
    return new NextResponse("SUCCESS");
  }
}
