import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Access from "@/src/models/Access";
import { getQpayToken } from "@/src/lib/qpay";

export async function GET(req: Request) {
  try {
    console.log("🔥 CALLBACK HIT");

    await connectDB();

    const { searchParams } = new URL(req.url);

    const payment_id =
      searchParams.get("qpay_payment_id") ||
      searchParams.get("payment_id");

    console.log("PAYMENT ID:", payment_id);

    if (!payment_id) return new NextResponse("SUCCESS");

    const token = await getQpayToken();

    // 🔴 ХАМГИЙН ЧУХАЛ ЗӨВ ENDPOINT
    const res = await fetch(
      "https://merchant.qpay.mn/v2/payment/check",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          object_type: "PAYMENT",
          object_id: payment_id,
        }),
      }
    );

    const text = await res.text();
    console.log("RAW RESPONSE:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.log("❌ NOT JSON RESPONSE");
      return new NextResponse("SUCCESS");
    }

    console.log("CHECK:", data);

    if (!data.rows?.length) return new NextResponse("SUCCESS");

    const row = data.rows[0];

    if (row.payment_status !== "PAID") {
      console.log("NOT PAID YET");
      return new NextResponse("SUCCESS");
    }

    const invoiceNo: string = row.sender_invoice_no;
    const [deviceId, monthsStr] = invoiceNo.split("_");
    const months = Number(monthsStr || 1);

    const expires = new Date();
    expires.setMonth(expires.getMonth() + months);

    await Access.findOneAndUpdate(
      { deviceId },
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
