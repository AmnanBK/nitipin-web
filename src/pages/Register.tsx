import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import loginIcon from '../assets/login_icon.png';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Name, Email, and Password are required.');
      return;
    }

    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await api.post('/api/auth/register/traveler', {
        name,
        email,
        password,
        phone: phone || undefined,
      });

      setSuccess('Registration successful! Redirecting to login page...');

      // Redirect otomatis ke halaman login setelah 2 detik
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Register Error:', err);
      setError(
        err.response?.data?.message || 
        'Registration failed. Please check your data again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-50 flex items-center justify-center p-4 lg:p-8 font-sans overflow-hidden">
      <div className="bg-white w-full max-w-7xl h-full lg:h-[85vh] rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 p-6 gap-8">
        
        {/* Sisi Kiri: Form Register */}
        <div className="flex flex-col justify-center px-4 md:px-12 lg:px-16 py-3 overflow-y-auto h-full">
          <div className="max-w-md w-full mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">Register</h1>
            <p className="text-xs text-gray-500 mb-3 leading-normal">
              If you already have an account register <br />
              You can{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                Login here !
              </Link>
            </p>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-3 rounded-md">
                <p className="text-xs text-red-700 font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-3 mb-3 rounded-md">
                <p className="text-xs text-green-700 font-medium">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Input Email */}
              <div className="space-y-1">
                <label className="block text-xs font-normal text-gray-600">Email</label>
                <div className="relative flex items-center">
                  <svg
                    className="absolute left-3 h-4.5 w-4.5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all"
                    required
                    disabled={isSubmitting || !!success}
                  />
                </div>
              </div>

              {/* Input Name */}
              <div className="space-y-1">
                <label className="block text-xs font-normal text-gray-600">Name</label>
                <div className="relative flex items-center">
                  <svg
                    className="absolute left-3 h-4.5 w-4.5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all"
                    required
                    disabled={isSubmitting || !!success}
                  />
                </div>
              </div>

              {/* Input Phone Number */}
              <div className="space-y-1">
                <label className="block text-xs font-normal text-gray-600">Phone Number</label>
                <div className="relative flex items-center">
                  <svg
                    className="absolute left-3 h-4.5 w-4.5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h2.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.252.934L7.05 7.05a10.97 10.97 0 004.182 4.182l1.202-1.202a1 1 0 01.934-.252l2.2.547a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all"
                    disabled={isSubmitting || !!success}
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="space-y-1">
                <label className="block text-xs font-normal text-gray-600">Password</label>
                <div className="relative flex items-center">
                  {/* Icon Padlock */}
                  <svg
                    className="absolute left-3 h-4.5 w-4.5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your Password"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all"
                    required
                    disabled={isSubmitting || !!success}
                  />
                  {/* Icon Visibility Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center"
                    disabled={isSubmitting || !!success}
                  >
                    {showPassword ? (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Tombol Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !!success}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-center flex items-center justify-center text-sm"
              >
                {isSubmitting ? (
                  <svg
                    className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  'Register'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Sisi Kanan: Visual Card */}
        <div className="hidden lg:flex bg-blue-600 rounded-3xl p-12 flex-col justify-between relative overflow-hidden">
          {/* Header kanan */}
          <div className="text-right">
            <span className="text-blue-100 text-sm font-medium tracking-wide">
              Your Go-To Global Shopping Companion
            </span>
          </div>

          {/* Visual Tengah */}
          <div className="flex flex-col items-center justify-center my-auto relative z-10 overflow-hidden w-full">
            <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg max-h-[48vh] flex items-center justify-center">
              <img
                src={loginIcon}
                alt="Nitipin Traveler"
                className="max-h-[48vh] w-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Label Bawah */}
          <div className="relative z-10 mt-4">
            <h2 className="text-white text-3xl lg:text-4xl xl:text-5xl font-semibold tracking-tight">
              Register to Nitipin
            </h2>
          </div>
          
          {/* Efek Gradasi / Latar Belakang */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl opacity-30 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-700 rounded-full filter blur-3xl opacity-50 -ml-32 -mb-32"></div>
        </div>

      </div>
    </div>
  );
}
