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

    // 🔴 1. payment detail → invoice_id авах
    const paymentRes = await fetch(
      `https://merchant.qpay.mn/v2/payment?payment_id=${payment_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const paymentText = await paymentRes.text();
    console.log("PAYMENT RAW:", paymentText);

    let paymentData;
    try {
      paymentData = JSON.parse(paymentText);
    } catch {
      console.log("❌ PAYMENT JSON ERROR");
      return new NextResponse("SUCCESS");
    }

    const invoice_id = paymentData.rows?.[0]?.invoice_id;

    console.log("INVOICE ID:", invoice_id);

    if (!invoice_id) return new NextResponse("SUCCESS");

    // 🔴 2. payment/check → invoice_id
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
          object_id: invoice_id,
        }),
      }
    );

    const checkData = await checkRes.json();
    console.log("CHECK:", checkData);

    if (!checkData.rows?.length) return new NextResponse("SUCCESS");

    const row = checkData.rows[0];

    if (row.payment_status !== "PAID") {
      console.log("NOT PAID");
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
