import { PropsWithChildren } from "react";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function AuthLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your username and password below to login to your
                        account.
                    </CardDescription>
                </CardHeader>
                {children}
            </Card>
        </div>
    );
}
