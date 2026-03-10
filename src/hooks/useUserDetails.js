import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";

const useUserDetails = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session || !session.user) {
          setError("User is not logged in.");
          return;
        }

        const userEmail = session.user.email;

        const { data: userData, error: userError } = await supabase
          .from("lecturers")
          .select("id, full_name, email, phone_number, created_at") // Changed fullName to full_name to match SQL
          .eq("email", userEmail)
          .single();

        if (userError) {
          if (userError.code === "PGRST116") {
            setError("Lecturer not found in the database.");
          } else {
            throw userError;
          }
        } else if (userData) {
          setUserDetails({
            lecturer_id: userData.id,
            fullName: userData.full_name, // Map back to camelCase for frontend consistency
            email: userData.email,
            phone_number: userData.phone_number,
            created_at: userData.created_at,
          });
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error(
          error.message === "TypeError: Failed to fetch"
            ? "Please check your Internet connection."
            : error.message
        );
        setError(
          error.message === "TypeError: Failed to fetch"
            ? "Please check your Internet connection."
            : error.message
        );
      }
    };

    fetchUserDetails();
  }, []);

  return { userDetails, userDetailsError: error };
};

export default useUserDetails;