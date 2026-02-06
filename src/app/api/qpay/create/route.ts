import { NextResponse } from "next/server";
import { getQpayToken } from "@/src/lib/qpay";

export async function POST(req: Request) {
  const { deviceId, months } = await req.json();

  const amount =
    months === 1 ? 10000 :
    months === 6 ? 20000 :
    30000;

  const senderInvoiceNo = `${deviceId}_${months}_${Date.now()}`;
  const token = await getQpayToken();

  const res = await fetch("https://merchant.qpay.mn/v2/invoice", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      invoice_code: process.env.QPAY_INVOICE_CODE,
      sender_invoice_no: senderInvoiceNo,
      invoice_receiver_code: "terminal",
      invoice_description: "VolleyLive subscription",
      amount,
      callback_url: `${process.env.BASE_URL}/api/qpay/callback`,
    }),
  });

  const data = await res.json();
  // DEBUG: console.log(data)

  return NextResponse.json({
    qr: data.qr_image,
    url: data.qPay_shortUrl, // 🔴 P том үсэг!
  });
}
