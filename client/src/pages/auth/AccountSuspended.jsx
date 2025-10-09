import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AccountSuspended() {
  const navigate = useNavigate();

  const handleContactSupport = () => {
    navigate("/contact-us");
  };

  const handleGoBack = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Account Suspended
          </CardTitle>
          <CardDescription className="text-gray-600">
            Your account has been suspended and you cannot access the platform at this time.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">What does this mean?</h3>
            <p className="text-sm text-red-700">
              Your account has been temporarily suspended due to a violation of our terms of service or for security reasons. 
              You will not be able to access your dashboard or participate in auctions until this issue is resolved.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">What can you do?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Contact our support team to understand the reason for suspension
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Provide any necessary documentation to resolve the issue
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Wait for our team to review and reactivate your account
              </li>
            </ul>
          </div>

          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleContactSupport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Need immediate assistance? Email us at{" "}
              <a 
                href="mailto:support@ikmangems.lk" 
                className="text-blue-600 hover:underline"
              >
                support@ikmangems.lk
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
