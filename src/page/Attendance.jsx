import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { calculateDistance } from "../utils/distanceCalculation";
import Input from "../component/Input";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";
import Spinner from "../component/Spinner";
import logo from "../assets/smartickk.png";

const Attendance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [isLoading, setIsLoading] = useState(false);
  const [userDistance, setUserDistance] = useState(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [classDetails, setClassDetails] = useState(null);
  const [matricNumber, setMatricNumber] = useState("");
  const [name, setName] = useState("");
  const [deviceId, setDeviceId] = useState(""); // New state for Device ID

  const courseId = queryParams.get("courseId");
  const lat = parseFloat(queryParams.get("lat"));
  const lng = parseFloat(queryParams.get("lng"));

  // 1. Effect to Get/Create Device ID (Fingerprint)
  useEffect(() => {
    let storedDeviceId = localStorage.getItem("smartick_device_id");
    if (!storedDeviceId) {
      // Generate a unique ID (UUID)
      storedDeviceId = crypto.randomUUID();
      localStorage.setItem("smartick_device_id", storedDeviceId);
    }
    setDeviceId(storedDeviceId);
  }, []);

  // 2. Effect to Fetch Class Details
  useEffect(() => {
    const fetchClassDetails = async () => {
        if(courseId) {
            const { data } = await supabase.from("classes").select("course_title, location_name").eq("course_id", courseId).single();
            setClassDetails(data);
        }
    };
    fetchClassDetails();
  }, [courseId]);

  // 3. Effect to Check Location
  useEffect(() => {
    if (!lat || !lng) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const distance = calculateDistance(position.coords.latitude, position.coords.longitude, lat, lng);
        setUserDistance(distance);
        setIsWithinRange(distance <= 100); // 100 meters
      },
      (err) => toast.error("Location permission denied.")
    );
  }, [lat, lng]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!matricNumber || !name) return toast.error("Fill all fields");
    if (!deviceId) return toast.error("Device ID not ready. Please wait.");
    setIsLoading(true);

    try {
      // --- CALL THE SECURE FUNCTION ---
      const { error } = await supabase.rpc('mark_attendance', {
        p_course_id: courseId,
        p_student: {
            matric_no: matricNumber.toUpperCase(), 
            name: name.toUpperCase(), 
            timestamp: new Date().toISOString(),
            device_id: deviceId // Pass the Device ID here
        }
      });

      if (error) {
        // This will show "Attendance already marked from this device..."
        toast.error(error.message);
      } else {
        toast.success("Attendance Marked Successfully!");
        navigate("/success");
      }
    } catch (err) {
        toast.error("An unexpected error occurred");
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <section className="h-screen grid place-items-center bg-gray-50 p-4">
      <div className="bg-white px-6 py-6 max-w-3xl rounded-xl shadow-lg w-full">
        <div className="flex justify-center mb-4"><img src={logo} alt="Logo" className="h-16 w-16" /></div>
        
        {classDetails && (
            <div className="bg-gray-100 p-4 rounded mb-4 text-sm">
                <p><strong>Course:</strong> {classDetails.course_title}</p>
                <p><strong>Venue:</strong> {classDetails.location_name}</p>
                <p><strong>Distance:</strong> {userDistance ? `${userDistance.toFixed(0)}m` : "Checking..."}</p>
            </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Matric No" value={matricNumber} onChange={(e) => setMatricNumber(e.target.value)} required />
          
          {isWithinRange ? (
            <button type="submit" disabled={isLoading} className="btn w-full bg-blue-600 text-white py-2">
              {isLoading ? <Spinner /> : "Mark Attendance"}
            </button>
          ) : (
            <p className="text-red-500 text-xs text-center">You are not within 100m of the venue.</p>
          )}
        </form>
      </div>
    </section>
  );
};

export default Attendance;