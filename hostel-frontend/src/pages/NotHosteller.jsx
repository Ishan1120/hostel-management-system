export default function NotHosteller() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-3">
          Access Restricted
        </h1>
        <p className="text-gray-600">
          You are not currently allocated a hostel room.
        </p>
        <p className="text-gray-500 mt-2">
          Please contact the hostel office for assistance.
        </p>
      </div>
    </div>
  );
}
