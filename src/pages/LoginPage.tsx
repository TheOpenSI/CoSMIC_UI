import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Button, Typography } from "antd";
import { getLoginUrl, getRegisterUrl } from "../api/auth";
import { useAuthStore } from "../stores/AuthStore";

export default function LoginPage() {
  const { Title, Text, Link } = Typography;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, checkSession } = useAuthStore();
  const authError = searchParams.get("error");

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  // Already logged in → skip login page
  useEffect(() => {
    if (!loading && user) {
      navigate("/chat", { replace: true });
    }
  }, [loading, user, navigate]);

  const handleSignIn = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-14 bg-white px-4">
      <Title level={1} className="mb-10!">
        Welcome to CoSMIC
      </Title>

      <div className="w-full max-w-md flex flex-col gap-4">
        {authError ? (
          <Alert
            type="error"
            showIcon
            message="Sign-in failed"
            description="Please try again or contact your administrator."
          />
        ) : null}

        <Text type="secondary">
          Sign in with your CoSMIC account. You will be redirected to our
          identity provider to enter your email and password securely.
        </Text>

        <Button
          type="primary"
          size="large"
          className="w-full h-12"
          loading={loading}
          onClick={handleSignIn}
        >
          Sign in
        </Button>

        <div className="flex flex-col items-center gap-2 pt-2">
          <Link href={getRegisterUrl()}>Don&apos;t have an account? Sign up</Link>
        </div>
      </div>
    </div>
  );
}