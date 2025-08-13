import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useVerifyOtpMutation } from "../../redux/features/auth/authApi";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

const OtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const phone = location.state?.phone?.toString();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (newOtp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length !== 4 || !phone) {
      toast.error("Invalid OTP or session expired");
      return;
    }

    

    try {
      await verifyOtp({ phone, code });
      toast.success("Account verified successfully")
      navigate('/login')
    } catch (err) {
      toast.error("OTP verification failed");
      console.error(err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted px-4">
      <Card className="w-full max-w-md rounded-2xl shadow-xl p-6">
        <CardContent>
          <h2 className="text-2xl font-semibold text-center mb-2">
            Verify OTP
          </h2>
          <p className="text-center text-muted-foreground mb-6">
            Enter the 4-digit code sent to{" "}
            <span className="font-medium">{phone}</span>
          </p>

          <div className="flex justify-center gap-4 mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                type="text"
                value={digit}
                maxLength={1}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                className="w-14 h-14 text-2xl text-center border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full text-base font-medium"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OtpVerification;
