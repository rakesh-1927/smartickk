import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import Input from "../component/Input";
import Spinner from "../component/Spinner";
import toast from "react-hot-toast";
import Footer from "../component/Footer";
import Logo from "../assets/smartickk.png";

const LoginLecturer = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Login successful");
      navigate("/classDetails");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen grid md:grid-cols-2">
      <div className="px-6 lg:px-20 py-8 flex flex-col justify-center h-screen overflow-auto">
        <div className="flex flex-col items-center mb-8">
          <img src={Logo} alt="Logo" className="h-24 w-24 object-contain" />
          <h2 className="text-[#000D46] font-bold text-3xl mt-4">Welcome Back!</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full py-2 bg-[#000D46] text-white rounded-md font-semibold flex justify-center">
            {isLoading ? <Spinner /> : "Login"}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-700">
          Don&apos;t have an account? <Link to="/registerLecturer" className="text-[#000D46] font-semibold">Register Now</Link>
        </p>
      </div>
      <div className="hidden md:block h-screen w-full bg-gray-200"></div>
      <Footer />
    </section>
  );
};

export default LoginLecturer;