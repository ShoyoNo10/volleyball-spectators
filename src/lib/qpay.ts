let accessToken = "";
let expireAt = 0;

async function fetchToken() {
  const res = await fetch("https://merchant.qpay.mn/v2/auth/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.QPAY_USERNAME + ":" + process.env.QPAY_PASSWORD
        ).toString("base64"),
    },
  });

  const data = await res.json();
  // expires_in секундээр ирдэг
  accessToken = data.access_token;
  expireAt = Date.now() + (data.expires_in - 60) * 1000; // 1 мин buffer
  return accessToken;
}

export async function getQpayToken() {
  if (accessToken && Date.now() < expireAt) return accessToken;
  return await fetchToken();
}
