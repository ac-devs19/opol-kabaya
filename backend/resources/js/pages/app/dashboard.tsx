import AppLayout from "@/layouts/app-layout";
import { ReactPortal } from "react";

export default function Dashboard() {
    return <div>dashboard</div>;
}

Dashboard.layout = (page: ReactPortal) => <AppLayout children={page} />;
