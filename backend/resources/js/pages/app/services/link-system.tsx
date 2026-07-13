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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { Loader2, MoreHorizontal, Plus, SquarePen } from "lucide-react";
import { ReactPortal, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type System = {
    id: number;
    label: string;
    icon: string;
    href: string;
    is_active: boolean;
};

export default function LinkSystem() {
    const queryClient = useQueryClient();
    const [openSheet, setOpenSheet] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [editingSystem, setEditingSystem] = useState<System | null>(null);

    const systemSchema = z.object({
        label: z.string().nonempty("The label field is required."),
        icon: editingSystem
            ? z.any().optional()
            : z.any().refine((file) => file instanceof File, {
                  message: "The icon field is required.",
              }),
        href: z.string().nonempty("The web link field is required."),
        is_active: z.string().nonempty("The active status field is required."),
    });

    type SystemForm = z.infer<typeof systemSchema>;

    const systemForm = useForm<SystemForm>({
        resolver: zodResolver(systemSchema),
        defaultValues: {
            label: "",
            icon: "",
            href: "",
            is_active: "",
        },
    });

    const {
        handleSubmit,
        setValue,
        watch,
        clearErrors,
        setError,
        formState: { errors },
    } = systemForm;

    const handleOpenSheet = (system?: System) => {
        setOpenSheet(!openSheet);
        clearErrors();

        if (system) {
            setEditingSystem(system);

            setValue("label", system.label);
            setValue("href", system.href);
            setValue("is_active", system.is_active ? "1" : "0");
            setValue("icon", "");
        } else {
            setEditingSystem(null);
            systemForm.reset();
        }
    };

    const addMutation = useMutation({
        mutationFn: async (data: SystemForm) => {
            const response = await axios.post(
                "/api/services/add/link-systems",
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["link-systems"] });
            handleOpenSheet();
            systemForm.reset();
            toast.success("Link system added successfully!");
        },
        onError: (error: any) => {
            const errors = error.response.data.errors;
            if (errors) {
                Object.keys(errors).forEach((field) => {
                    setError(field as keyof SystemForm, {
                        type: "server",
                        message: errors[field][0],
                    });
                });
            }
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: SystemForm) => {
            const response = await axios.post(
                `/api/services/update/link-systems/${editingSystem?.id}`,
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["link-systems"] });
            handleOpenSheet();
            setEditingSystem(null);
            toast.success("Link system updated successfully!");
        },
        onError: (error: any) => {
            const errors = error.response.data.errors;
            if (errors) {
                Object.keys(errors).forEach((field) => {
                    setError(field as keyof SystemForm, {
                        type: "server",
                        message: errors[field][0],
                    });
                });
            }
        },
    });

    const processing = addMutation.isPending || updateMutation.isPending;

    const onSubmit = (data: SystemForm) => {
        if (editingSystem) {
            updateMutation.mutate(data);
        } else {
            addMutation.mutate(data);
        }
    };

    const fetchSystem = async ({ queryKey }: any) => {
        const [_key, page, search] = queryKey;

        const { data } = await axios.get("/api/services/link-systems", {
            params: {
                page,
                search,
            },
        });

        return data;
    };

    const { data, isLoading } = useQuery({
        queryKey: ["link-systems", page, search],
        queryFn: fetchSystem,
    });

    const columns: ColumnDef<System>[] = [
        {
            accessorKey: "icon",
            header: "",
            cell: ({ row }) => {
                const system = row.original;
                return (
                    <img
                        src={`http://127.0.0.1:8000/storage/${system.icon}`}
                        alt={system.label}
                        className="size-14 object-contain"
                    />
                );
            },
        },
        {
            accessorKey: "label",
            header: "Label",
        },
        {
            accessorKey: "href",
            header: "Web link",
            cell: ({ row }) => {
                const system = row.original;
                return (
                    <a
                        href={system.href}
                        target="_blank"
                        className="hover:underline"
                    >
                        {system.href}
                    </a>
                );
            },
        },
        {
            accessorKey: "is_active",
            header: "Active Status",
            cell: ({ row }) => {
                const system = row.original;
                return (
                    <div
                        className={cn(
                            "rounded-full py-1 px-2 w-fit text-xs font-semibold",
                            system.is_active
                                ? "bg-green-100/80 text-green-600"
                                : "bg-red-100/80 text-red-600",
                        )}
                    >
                        {system.is_active ? "Active" : "Inactive"}
                    </div>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const system = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => handleOpenSheet(system)}
                            >
                                <SquarePen />
                                Edit
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <>
            <Card className="p-4">
                <DataTable
                    columns={columns}
                    data={data?.data ?? []}
                    page={page}
                    lastPage={data?.last_page ?? 1}
                    setPage={setPage}
                    search={search}
                    setSearch={setSearch}
                    button={
                        <Button onClick={() => handleOpenSheet()}>
                            <Plus />
                            Add Link
                        </Button>
                    }
                />
            </Card>

            <Sheet
                open={openSheet}
                onOpenChange={() => {
                    if (!processing) {
                        handleOpenSheet();
                    }
                }}
            >
                <SheetContent className="flex flex-col">
                    <SheetHeader>
                        <SheetTitle>
                            {editingSystem
                                ? "Edit Link System"
                                : "Add Link System"}
                        </SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
                        <div className="space-y-1">
                            <Label>Icon</Label>
                            <Input
                                type="file"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setValue("icon", file);
                                }}
                            />
                            <InputError
                                message={errors.icon?.message?.toString()}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Label</Label>
                            <Input
                                value={watch("label")}
                                onChange={(e) =>
                                    setValue("label", e.target.value)
                                }
                            />
                            <InputError message={errors.label?.message} />
                        </div>
                        <div className="space-y-1">
                            <Label>Web Link</Label>
                            <Input
                                value={watch("href")}
                                onChange={(e) =>
                                    setValue("href", e.target.value)
                                }
                            />
                            <InputError message={errors.href?.message} />
                        </div>
                        <div className="space-y-1">
                            <Label>Active Status</Label>
                            <Select
                                value={watch("is_active")}
                                onValueChange={(val) =>
                                    setValue("is_active", val)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="1">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="0">
                                            Inactive
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.is_active?.message} />
                        </div>
                    </div>
                    <SheetFooter>
                        <Button
                            onClick={handleSubmit(onSubmit)}
                            disabled={processing}
                        >
                            {processing && <Loader2 className="animate-spin" />}
                            {processing
                                ? editingSystem
                                    ? "Updating..."
                                    : "Saving..."
                                : editingSystem
                                  ? "Update"
                                  : "Save"}
                        </Button>
                        <SheetClose asChild>
                            <Button variant="outline">Close</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}

LinkSystem.layout = (page: ReactPortal) => <AppLayout children={page} />;
