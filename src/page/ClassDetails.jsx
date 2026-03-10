import { Link } from "react-router-dom";
import LogoutButton from "../component/LogoutButton";
import useUserDetails from "../hooks/useUserDetails";
import logo from "../assets/smartickk.png";
import Footer from "../component/Footer";

const ClassDetails = () => {
  const { userDetails } = useUserDetails();

  return (
    <div className="flex flex-col min-h-screen max-w-7xl mx-auto">
      <div className="flex justify-end pt-8 pr-8">
        <LogoutButton />
      </div>
      <div className="flex flex-col gap-y-10 justify-center items-center flex-1">
        <div className="flex flex-col items-center">
          <img src={logo} alt="Logo" className="h-24 w-24 object-contain" />
          <h2 className="text-center font-bold text-neutral-800 mt-4 lg:text-4xl text-2xl">
            Welcome, {userDetails?.fullName || "Lecturer"}
          </h2>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/previousClass" className="btn bg-transparent border border-black text-black hover:bg-black hover:text-white px-6 py-2 rounded-lg">
            Previous Class
          </Link>
          <Link to="/classSchedule" className="btn bg-[#000D46] text-white px-6 py-2 rounded-lg hover:bg-[#000A36]">
            Create Class
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ClassDetails;