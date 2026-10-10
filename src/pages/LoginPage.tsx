/// --- Core libraries --- ///
import { useEffect } from "react";
import {
	useNavigate,
	useSearchParams
} from "react-router-dom";
import {
	Alert,
	Button,
	Spin,
	Typography
} from "antd";


/// --- Type hints --- ///


/// --- Internal libraries --- ///
import { getLoginUrl } from "../api/auth";


/**
 * A request to `/login` hands the browser straight to Keycloak, which shows the
 * typical username/password form + Google & Microsoft icons.
 *
 * If the callback came back with an `error`, we show a minimal retry card
 * instead of redirecting again. This way, a failing IdP cannot trap the user in
 * a redirect loop.
 */
export default function LoginPage() {
	const { Text } = Typography;
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const authError = searchParams.get("error");

	useEffect(
		() => {
			if (!authError) {
				window.location.replace(getLoginUrl());
			}
		},
		[authError]
	);

	if (!authError) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white px-4">
				<Spin size="large" />
				<Text type="secondary">Redirecting to sign in…</Text>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-start pt-14 bg-white px-4">
			<div className="w-full max-w-md flex flex-col gap-4">
				<Alert
					type="error"
					showIcon
					title="Sign-in failed"
					description="Please try again or contact your administrator."
				/>
				<Button
					type="primary"
					size="large"
					className="w-full h-12"
					onClick={() => {
						navigate("/login", { replace: true });
						window.location.replace(getLoginUrl());
					}}
				>
				Try again
				</Button>
			</div>
		</div>
	);
}
