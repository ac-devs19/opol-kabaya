import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AppLayout from "@/layouts/app-layout";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { MoreHorizontal } from "lucide-react";
import { ReactPortal, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { debounce } from "lodash";

type Resident = {
    id: number;
    id_number: string;
    last_name: string;
    first_name: string;
    middle_name: string;
    suffix: string;
    user_verified_at: string;
};

const columns: ColumnDef<Resident>[] = [
    {
        accessorKey: "id_number",
        header: "ID Number",
    },
    {
        accessorKey: "last_name",
        header: "Last Name",
    },
    {
        accessorKey: "first_name",
        header: "First Name",
    },
    {
        accessorKey: "middle_name",
        header: "Middle Name",
        cell: ({ row }) => {
            const resident = row.original;
            return resident.middle_name ?? "N/A";
        },
    },
    {
        accessorKey: "suffix",
        header: "Suffix",
        cell: ({ row }) => {
            const resident = row.original;
            return resident.suffix ?? "N/A";
        },
    },
    {
        accessorKey: "user_verified_at",
        header: "Verification Status",
        cell: ({ row }) => {
            const resident = row.original;
            return (
                <div
                    className={cn(
                        "rounded-full py-1 px-2 w-fit text-xs font-semibold",
                        resident.user_verified_at
                            ? "bg-green-100/80 text-green-600"
                            : "bg-red-100/80 text-red-600",
                    )}
                >
                    {resident.user_verified_at ? "Verified" : "Not Verified"}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const resident = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function Resident() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const fetchResident = async ({ queryKey }: any) => {
        const [_key, page, debouncedSearch] = queryKey;

        const { data } = await axios.get("/api/users/residents", {
            params: {
                page,
                search: debouncedSearch,
            },
        });

        return data;
    };

    const debouncedSearchFn = useMemo(
        () => debounce((value) => setDebouncedSearch(value), 800),
        [],
    );

    const handleSearch = (value: string) => {
        setSearch(value);
        debouncedSearchFn(value);
    };

    const { data, isLoading } = useQuery({
        queryKey: ["residents", page, debouncedSearch],
        queryFn: fetchResident,
    });

    return (
        <Card className="p-4">
            <DataTable
                columns={columns}
                data={data?.data ?? []}
                page={page}
                lastPage={data?.last_page ?? 1}
                setPage={setPage}
                search={search}
                setSearch={handleSearch}
            />
        </Card>
    );
}

Resident.layout = (page: ReactPortal) => <AppLayout children={page} />;
