import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Input from "../component/Input";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Footer from "../component/Footer";
import Logo from "../assets/smartickk.png";

const RegisterLecturer = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber
          }
        }
      });

      if (error) throw error;

      // REMOVED: The manual upsert code block is gone.
      // The trigger handles the database insertion automatically.

      // Check if user needs to confirm email
      if (data.session) {
         toast.success("Registration successful!");
         navigate("/classSchedule"); // Go straight to dashboard
      } else {
         // If confirmation is ON, tell user to check email
         toast.success("Check your email to confirm your account.");
         navigate("/loginLecturer");
      }
      
      

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen grid md:grid-cols-2">
      <form onSubmit={handleRegister} className="px-6 lg:px-20 py-8 h-screen overflow-auto flex flex-col justify-center">
        <div className="flex flex-col items-center mb-8">
          <img src={Logo} alt="Logo" className="h-24 w-24 object-contain" />
          <h2 className="text-[#000D46] font-bold text-3xl mt-4">Create Account</h2>
        </div>
        <div className="grid gap-4">
          <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <Input label="Phone Number" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
        </div>
        <button type="submit" disabled={isLoading} className="w-full mt-4 py-2 bg-[#000D46] text-white font-bold rounded-md">
          {isLoading ? "Creating..." : "Create Account"}
        </button>
        <p className="mt-4 text-center text-gray-700">
          Already have an account? <Link to="/loginLecturer" className="text-[#000D46] font-semibold">Login</Link>
        </p>
      </form>
      <div className="hidden md:block h-screen w-full bg-gray-200"></div>
      <Footer />
    </section>
  );
};

export default RegisterLecturer;