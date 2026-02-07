import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Access from "@/src/models/Access";
import { getQpayToken } from "@/src/lib/qpay";

export async function GET(req: Request) {
  try {
    console.log("🔥 CALLBACK HIT");
    await connectDB();

    const { searchParams } = new URL(req.url);
    const payment_id = searchParams.get("payment_id");
    console.log("payment_id:", payment_id);

    if (!payment_id) return new NextResponse("SUCCESS", { status: 200 });

    const token = await getQpayToken();

    // Төлбөр шалгах
    const checkRes = await fetch("https://merchant.qpay.mn/v2/payment/check", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payment_id }),
    });

    const data = await checkRes.json();
    console.log("CHECK:", data);

    if (data.payment_status !== "PAID") {
      console.log("Not paid yet");
      return new NextResponse("SUCCESS", { status: 200 });
    }

    // sender_invoice_no = deviceId_months_timestamp
    const invoiceNo: string = data.sender_invoice_no || "";
    const [deviceId, monthsStr] = invoiceNo.split("_");
    const months = Number(monthsStr || 1);

    const expires = new Date();
    expires.setMonth(expires.getMonth() + months);

    await Access.findOneAndUpdate(
      { deviceId },
      { expiresAt: expires },
      { upsert: true }
    );

    console.log("✅ ACCESS UNLOCKED for", deviceId);
    return new NextResponse("SUCCESS", { status: 200 });
  } catch (e) {
    console.log("❌ CALLBACK ERROR:", e);
    // QPay-д заавал 200 + SUCCESS буцаана
    return new NextResponse("SUCCESS", { status: 200 });
  }
}
