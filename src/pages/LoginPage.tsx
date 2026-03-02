import { Button, Input, Typography } from "antd";
import { HiOutlineMail } from "react-icons/hi";
import { HiOutlineLockClosed } from "react-icons/hi2";

export default function LoginPage() {
  const { Title, Text, Link } = Typography;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-14 bg-white px-4">
      {/* Title */}
      <Title level={1} className="mb-10!">
        Welcome to CoSMIC
      </Title>

      {/* Card */}
      <div className="w-full max-w-md">
        {/* Form fields */}
        <div className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <Text type="secondary" style={{ fontSize: 14 }}>
              Email address
            </Text>
            <Input
              size="large"
              placeholder="Your email address"
              prefix={<HiOutlineMail className="text-gray-400" />}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Text type="secondary" style={{ fontSize: 14 }}>
              Your Password
            </Text>
            <Input.Password
              size="large"
              placeholder="Your password"
              prefix={<HiOutlineLockClosed className="text-gray-400" />}
            />
          </div>

          {/* Sign in button */}
          <Button type="primary" size="large" className="w-full h-12 !mt-2">
            Sign in
          </Button>

          {/* Links */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <Link className="underline">Forgot your password?</Link>
            <Link className="underline">
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
