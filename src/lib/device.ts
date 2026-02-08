// export function getDeviceId() {
//   if (typeof window === "undefined") return "";

//   let id = localStorage.getItem("device_id");

//   if (!id) {
//     id = crypto.randomUUID();
//     localStorage.setItem("device_id", id);
//   }

//   return id;
// }
export function getDeviceId() {
  let id = localStorage.getItem("deviceId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("deviceId", id);
    document.cookie = `deviceId=${id}; path=/; max-age=31536000; SameSite=Lax`;
  }
  return id;
}

