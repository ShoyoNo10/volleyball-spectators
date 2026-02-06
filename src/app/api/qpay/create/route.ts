import { NextResponse } from "next/server";
import { getQpayToken } from "@/src/lib/qpay";

export async function POST(req: Request) {
  try {
    const { deviceId, months } = await req.json();

    console.log("DEVICE:", deviceId);

    const token = await getQpayToken();
    console.log("TOKEN OK");

    const res = await fetch("https://merchant.qpay.mn/v2/invoice", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        invoice_code: process.env.QPAY_INVOICE_CODE,
        sender_invoice_no: deviceId + "_" + months,
        invoice_receiver_code: "terminal",
        invoice_description: "VolleyLive",
        amount: 10000,
        callback_url: process.env.BASE_URL + "/api/qpay/callback",
      }),
    });

    const data = await res.json();

    console.log("🔥 QPAY RESPONSE:", data);

    return NextResponse.json({
      url: data.qPay_shortUrl || null
    });

  } catch (err: unknown) {
    console.log("❌ ERROR:", err);
    return NextResponse.json({ error: "server error" });
  }
}

