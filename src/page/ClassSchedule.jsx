import { useState } from "react";
import Input from "../component/Input";
import MapModal from "../component/MapModal";
import QRCodeModal from "../component/QRCodeModal";
import { supabase } from "../utils/supabaseClient";
import useUserDetails from "../hooks/useUserDetails";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Footer from "../component/Footer";
import logo from "../assets/smartickk.png";

const VERCEL_URL = import.meta.env.VITE_VERCEL_URL || "http://localhost:5173";

const ClassSchedule = () => {
  const { userDetails } = useUserDetails();
  const [formData, setFormData] = useState({ courseTitle: "", courseCode: "", lectureVenue: "", time: "", date: "", note: "" });
  const [selectedLocationCoordinate, setSelectedLocationCoordinate] = useState(null);
  const [qrData, setQrData] = useState("");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLocationChange = (locationName, coordinate) => {
    setFormData({ ...formData, lectureVenue: locationName });
    setSelectedLocationCoordinate(coordinate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Add this check to prevent 401 errors if user isn't loaded yet
    if (!userDetails || !userDetails.lecturer_id) {
      return toast.error("User not logged in or details loading...");
    }

    if (!selectedLocationCoordinate) return toast.error("Select location on map");
    // ... rest of your code

    const { courseTitle, courseCode, lectureVenue, time, date, note } = formData;
    const lecturerId = userDetails.lecturer_id;

    const locationGeography = `SRID=4326;POINT(${selectedLocationCoordinate.lng} ${selectedLocationCoordinate.lat})`;

    const { data, error } = await supabase
      .from("classes")
      .insert([{
        course_title: courseTitle, course_code: courseCode,
        time: new Date(`${date}T${time}`).toISOString(),
        date: new Date(date).toISOString(), location: locationGeography, note,
        lecturer_id: lecturerId, location_name: lectureVenue
      }])
      .select("course_id");

    if (error) return toast.error(error.message);

    toast.success("Class created!");
    const generatedCourseId = data[0]?.course_id;

    // Construct Student Attendance Link
    const attendanceLink = `${VERCEL_URL}/attendance?courseId=${generatedCourseId}&courseCode=${courseCode}&lat=${selectedLocationCoordinate.lat}&lng=${selectedLocationCoordinate.lng}`;

    setQrData(attendanceLink);
    setIsQRModalOpen(true);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[100vh] bg-gray-100">
      <div className="w-full md:w-1/2 p-4 flex flex-col justify-center relative">
        <Link to="/classDetails" className="btn btn-sm rounded-full bg-blue-500 text-white w-20 mb-4">Back</Link>
        <div className="w-full max-w-2xl h-[90vh] overflow-y-auto mt-4">
          <div className="flex justify-center mb-4"><img src={logo} alt="Logo" className="h-20 w-20" /></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Course Title" name="courseTitle" onChange={handleInputChange} value={formData.courseTitle} required />
            <Input label="Course Code" name="courseCode" onChange={handleInputChange} value={formData.courseCode} required />

            <div className="relative">
              <Input
                label="Venue"
                name="lectureVenue"
                value={formData.lectureVenue}
                onChange={() => { }} // Added to satisfy React controlled component warning
                readOnly
                required
              />
              <button type="button" onClick={() => setIsMapModalOpen(true)} className="absolute right-0 top-9 px-3 bg-green-500 text-white rounded-r-md h-[42px]">Map</button>
            </div>

            <Input type="time" label="Time" name="time" onChange={handleInputChange} value={formData.time} required />
            <Input type="date" label="Date" name="date" onChange={handleInputChange} value={formData.date} required />
            <Input label="Note" name="note" onChange={handleInputChange} value={formData.note} />

            <button type="submit" className="w-full btn bg-blue-500 text-white py-2">Generate QR</button>
          </form>
        </div>
      </div>
      <div className="hidden md:block w-1/2 h-screen bg-gray-300"></div>

      {isMapModalOpen && <MapModal onClose={() => setIsMapModalOpen(false)} onSelectLocation={handleLocationChange} />}
      {isQRModalOpen && <QRCodeModal qrData={qrData} onClose={() => setIsQRModalOpen(false)} />}
      <Footer />
    </div>
  );
};

export default ClassSchedule;