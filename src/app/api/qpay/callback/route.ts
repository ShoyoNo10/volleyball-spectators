import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Access from "@/src/models/Access";
import { getQpayToken } from "@/src/lib/qpay";

export async function GET(req: Request) {
  try {
    await connectDB();

    console.log("🔥 QPAY CALLBACK HIT");

    const { searchParams } = new URL(req.url);
    const payment_id = searchParams.get("payment_id");

    console.log("PAYMENT ID:", payment_id);

    if (!payment_id) {
      return new NextResponse("SUCCESS");
    }

    // 🔐 QPay token
    const token = await getQpayToken();

    // 💰 төлбөр шалгах
    const checkRes = await fetch(
      "https://merchant.qpay.mn/v2/payment/check",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_id,
        }),
      }
    );

    const data = await checkRes.json();

    console.log("CHECK RESPONSE:", data);

    if (data.payment_status !== "PAID") {
      console.log("NOT PAID");
      return new NextResponse("SUCCESS");
    }

    // 🧠 sender_invoice_no = deviceId_months_timestamp
    const invoiceNo: string = data.sender_invoice_no;
    const parts = invoiceNo.split("_");

    const deviceId = parts[0];
    const months = Number(parts[1] || 1);

    console.log("DEVICE:", deviceId, "MONTHS:", months);

    // 📅 хугацаа тооцох
    const expires = new Date();
    expires.setMonth(expires.getMonth() + months);

    await Access.findOneAndUpdate(
      { deviceId },
      { expiresAt: expires },
      { upsert: true }
    );

    console.log("✅ ACCESS UNLOCKED");

    // QPay-д заавал
    return new NextResponse("SUCCESS");

  } catch (err) {
    console.log("❌ CALLBACK ERROR:", err);
    return new NextResponse("SUCCESS");
  }
}
