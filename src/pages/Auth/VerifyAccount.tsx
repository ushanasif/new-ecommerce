/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useActivateAccountMutation } from '../../redux/features/auth/authApi';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { useAppDispatch } from '../../redux/hooks'; // Make sure you have this hook
import { setUser } from '../../redux/features/auth/authSlice';

const VerifyAccount: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [activateAccount, { isLoading }] = useActivateAccountMutation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [message, setMessage] = useState('Verifying your account...');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (token) {
      const verifyAccount = async () => {
        try {
          const result = await activateAccount({ token });
          
          // Check if the mutation was successful
          if ('data' in result && result.data) {
            const response = result.data;
            
            if (response.success || response.statusCode === 200) {
              setIsSuccess(true);
              setIsError(false);
              setMessage('Account verified successfully!');
              
              // Store user data and tokens in Redux
              if (response.data && response.data.user && response.data.accessToken) {
                dispatch(setUser({
                  user: response.data.user,
                  token: response.data.accessToken
                }));
              }
              
              setTimeout(() => navigate('/login'), 3000);
            } else {
              throw new Error(response.message || 'Verification failed');
            }
          } else if ('error' in result) {
            // Handle RTK Query error
            const error = result.error as any;
            setIsError(true);
            setIsSuccess(false);
            
            if (error.data?.message?.includes('expired') || error.data?.message?.includes('Verification link has expired')) {
              setMessage('Verification link has expired. Please register again.');
            } else if (error.status === 409 || error.data?.message?.includes('already')) {
              setMessage('Account already verified. Please login.');
            } else {
              setMessage(error.data?.message || 'Verification failed. Please try again.');
            }
          }
        } catch (error: any) {
          setIsError(true);
          setIsSuccess(false);
          
          if (error.message?.includes('expired')) {
            setMessage('Verification link has expired. Please register again.');
          } else if (error.message?.includes('already')) {
            setMessage('Account already verified. Please login.');
          } else {
            setMessage('Verification failed. Please try again.');
          }
        }
      };
      verifyAccount();
    }
  }, [token, activateAccount, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {isLoading ? (
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        ) : isSuccess ? (
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        ) : isError ? (
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        ) : (
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        )}
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isLoading ? 'Verifying...' : isSuccess ? 'Verified!' : isError ? 'Verification Failed' : 'Verifying...'}
        </h2>
        
        <p className="text-gray-600 mb-4">{message}</p>
        
        {isSuccess && (
          <p className="text-sm text-gray-500">
            Redirecting to login page...
          </p>
        )}
        
        {isError && (
          <div className="space-y-2">
            <button
              onClick={() => navigate('/register')}
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 mr-2"
            >
              Go to Registration
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyAccount;