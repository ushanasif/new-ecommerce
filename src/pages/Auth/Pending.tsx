import { CheckCircle, Mail } from "lucide-react";
import {Link} from "react-router-dom"

const Pending = () => {
  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gray-50">
      <div className="container max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <Mail className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">Almost Done!</h1>

        <p className="text-gray-600 mb-6">
          We've sent an activation link to your email address. Please check your
          inbox and click the link to activate your account.
        </p>

        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span>Check your spam folder if you don't see the email</span>
          </div>
        </div>

        <Link to={"/register"}>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
            Resend Email
          </button>
        </Link>

        {/* <p className="mt-6 text-sm text-gray-500">
          Need help?{" "}
          <a href="#" className="text-blue-600 hover:text-blue-800">
            Contact support
          </a>
        </p> */}
      </div>
    </div>
  );
};

export default Pending;
