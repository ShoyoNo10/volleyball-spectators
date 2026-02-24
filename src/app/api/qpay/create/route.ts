// import { NextResponse } from "next/server";
// import { getQpayToken } from "@/src/lib/qpay";
// import { connectDB } from "@/src/lib/mongodb";
// import Invoice from "@/src/models/Invoice";
// import { cookies } from "next/headers";
// import { verifyToken } from "@/src/lib/auth";

// export async function POST(req: Request) {
//   try {
//     const { months } = await req.json();

//     await connectDB();

//     // 🔐 USER from cookie
//     const token = (await cookies()).get("token")?.value;
//     if (!token) return NextResponse.json({ error: "not logged in" });

//     const payload = verifyToken(token);
//     if (!payload) return NextResponse.json({ error: "invalid token" });

//     const userId = payload.userId;

//     const qpayToken = await getQpayToken();

//     const res = await fetch("https://merchant.qpay.mn/v2/invoice", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${qpayToken}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         invoice_code: process.env.QPAY_INVOICE_CODE,
//         sender_invoice_no: `${userId}_${Date.now()}`, // 🔥 unique
//         invoice_receiver_code: "terminal",
//         invoice_description: "VolleyLive PRO",
//         amount: months === 1 ? 10000 : months === 6 ? 20000 : 30000,
//         callback_url: process.env.BASE_URL + "/api/qpay/callback",
//       }),
//     });

//     const data = await res.json();
//     console.log("🔥 QPAY RESPONSE:", data);

//     // 🔥 invoice DB save
//     await Invoice.create({
//       invoiceId: data.invoice_id,
//       userId: userId,
//       months,
//     });

//     return NextResponse.json({
//       url: data.qPay_shortUrl || null,
//     });

//   } catch (err) {
//     console.log("❌ CREATE INVOICE ERROR:", err);
//     return NextResponse.json({ error: "server error" });
//   }
// }

import { NextResponse } from "next/server";
import { getQpayToken } from "@/src/lib/qpay";
import { connectDB } from "@/src/lib/mongodb";
import Invoice from "@/src/models/Invoice";
import { cookies } from "next/headers";
import { verifyToken } from "@/src/lib/auth";

export async function POST(req: Request) {
  try {
    const { months } = await req.json();

    await connectDB();

    // 🔐 USER from cookie
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "not logged in" });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "invalid token" });

    const userId = payload.userId;

    const qpayToken = await getQpayToken();

    const res = await fetch("https://merchant.qpay.mn/v2/invoice", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${qpayToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        invoice_code: process.env.QPAY_INVOICE_CODE,
        sender_invoice_no: `${userId}_${Date.now()}`, // 🔥 unique
        invoice_receiver_code: "terminal",
        invoice_description: "VolleyLive PRO",
        amount: months === 1 ? 10000 : months === 6 ? 20000 : 30000,
        callback_url: process.env.BASE_URL + "/api/qpay/callback",
      }),
    });

    const data = await res.json();
    console.log("🔥 QPAY RESPONSE:", data);

    // 🔥 invoice DB save
    await Invoice.create({
      invoiceId: data.invoice_id,
      userId: userId,
      months,
    });

return NextResponse.json({
  invoice_id: data.invoice_id,
  url: data.qPay_shortUrl || null,
  qr_text: data.qr_text || null,
  qr_image: data.qr_image || null, // base64 png
});
  } catch (err) {
    console.log("❌ CREATE INVOICE ERROR:", err);
    return NextResponse.json({ error: "server error" });
  }
}
