import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import toast from "react-hot-toast";
import { supabase } from "../utils/supabaseClient";
import useUserDetails from "../hooks/useUserDetails";
import AttendanceListModal from "../component/AttendanceListModal";
import Footer from "../component/Footer";

const PreviousClass = () => {
  const { userDetails } = useUserDetails();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!userDetails?.lecturer_id) return;

      try {
        // FIX 1: We use select("*") to get all class columns (including attendance).
        // FIX 2: We use the syntax below to also fetch the related lecturer details.
        // This assumes your foreign key is set up correctly (lecturer_id -> id).
        const { data, error } = await supabase
          .from("classes")
          .select(`
            *,
            lecturers (
              full_name,
              email
            )
          `)
          .eq("lecturer_id", userDetails.lecturer_id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Transform data so your modal can read it easily
        // The 'lecturers' object comes as { full_name: "...", email: "..." }
        // We map it to match what your modal expects (selectedClass.lecturer.fullName)
        const formattedData = data.map(c => ({
            ...c,
            lecturer: c.lecturers ? {
                fullName: c.lecturers.full_name,
                email: c.lecturers.email
            } : null
        }));

        setClasses(formattedData || []);
      } catch (err) {
        console.error("Error fetching classes:", err);
        toast.error(err.message);
      }
    };

    fetchClasses();
  }, [userDetails]);

  return (
    <section className="pb-20 pt-8 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/classDetails">
          <button className="btn btn-sm bg-blue-500 text-white rounded-full">
            <BiArrowBack /> Back
          </button>
        </Link>
        <h2 className="text-2xl font-bold text-black text-center flex-1">
          Previous Classes
        </h2>
      </div>

      {!userDetails ? (
        <p className="text-center text-gray-500">Loading user details...</p>
      ) : classes.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">S/N</th>
                <th className="p-2">Course</th>
                <th className="p-2">Date</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c, i) => (
                <tr key={c.course_id} className="border-b text-center">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{c.course_code}</td>
                  <td className="p-2">
                    {c.date ? new Date(c.date).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => {
                        setSelectedClass(c);
                        setIsModalOpen(true);
                      }}
                      className="btn btn-xs bg-green-500 text-white"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">No classes found.</p>
      )}

      {/* 
         selectedClass now includes the 'lecturer' object formatted 
         specifically for your modal 
      */}
      <AttendanceListModal
        isOpen={isModalOpen}
        selectedClass={selectedClass}
        onClose={() => setIsModalOpen(false)}
      />
      <Footer />
    </section>
  );
};

export default PreviousClass;