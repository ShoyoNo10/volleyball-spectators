export default function Packages() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold text-vnl mb-6">
        Live Access Packages
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-bold text-xl mb-2">1 Day</h2>
          <p className="text-2xl font-bold mb-4">1000₮</p>
          <p>24 цаг Live үзэх эрх</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-bold text-xl mb-2">1 Month</h2>
          <p className="text-2xl font-bold mb-4">10,000₮</p>
          <p>30 хоног Live үзэх эрх</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-bold text-xl mb-2">6 Months</h2>
          <p className="text-2xl font-bold mb-4">60,000₮</p>
          <p>180 хоног Live үзэх эрх</p>
        </div>
      </div>

      <p className="text-gray-500 mt-6">
        QPay холбохоор энэ хэсэг дээр төлбөрийн QR гарч ирнэ
      </p>
    </div>
  );
}
