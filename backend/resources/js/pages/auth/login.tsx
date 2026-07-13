import { CardContent, CardFooter } from "@/components/ui/card";
import AuthLayout from "@/layouts/auth-layout";
import { useForm } from "@inertiajs/react";
import { ReactPortal } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputError from "@/components/input-error";

export default function Login() {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        user_name: "",
        password: "",
    });

    const handleLogin = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        clearErrors();
        post(route("login"));
    };

    return (
        <form onSubmit={handleLogin}>
            <CardContent className="space-y-6">
                <div className="space-y-1">
                    <Label>Username</Label>
                    <Input
                        value={data.user_name}
                        onChange={(e) => setData("user_name", e.target.value)}
                        placeholder="Enter your username"
                    />
                    <InputError message={errors.user_name} />
                </div>
                <div className="space-y-1">
                    <Label>Password</Label>
                    <Input
                        value={data.password}
                        onChange={(e) => setData("password", e.target.value)}
                        type="password"
                        placeholder="Enter your password"
                    />
                    <InputError message={errors.password} />
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" disabled={processing}>
                    Log in
                </Button>
            </CardFooter>
        </form>
    );
}

Login.layout = (page: ReactPortal) => <AuthLayout children={page} />;
