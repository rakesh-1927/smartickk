import { FaCheckCircle } from "react-icons/fa";

const SuccessPage = () => {
  return (
    <section className="h-screen grid place-items-center bg-green-100 px-4">
      <div className="bg-white px-6 py-8 rounded-xl shadow-lg text-center max-w-md">
        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-green-800 mb-4">Success!</h1>
        <p className="text-gray-700 mb-6">Attendance marked successfully.</p>
        <button className="btn bg-green-500 text-white px-4 py-2 rounded">Done</button>
      </div>
    </section>
  );
};

export default SuccessPage;