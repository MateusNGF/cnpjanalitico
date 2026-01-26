"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type Company = {
    id: string
    razao_social: string
    cnae_descricao: string
    situacao_cadastral: "Ativa" | "Baixada" | "Inapta" | "Suspensa"
    capital_social: number
    idade_anos: number
    socio_principal: string
}

const data: Company[] = [
    {
        id: "m5gr84i9",
        razao_social: "TECH SOLUTIONS LTDA",
        cnae_descricao: "Desenvolvimento de Software",
        situacao_cadastral: "Ativa",
        capital_social: 150000,
        idade_anos: 5,
        socio_principal: "Carlos Silva",
    },
    {
        id: "3u1re74j",
        razao_social: "PADARIA DO JOAO ME",
        cnae_descricao: "Panificação",
        situacao_cadastral: "Ativa",
        capital_social: 10000,
        idade_anos: 12,
        socio_principal: "João Souza",
    },
    {
        id: "derv1ws0",
        razao_social: "CONSULTORIA EMPRESARIAL XYZ",
        cnae_descricao: "Consultoria em Gestão",
        situacao_cadastral: "Baixada",
        capital_social: 50000,
        idade_anos: 3,
        socio_principal: "Ana Pereira",
    },
    {
        id: "5k8821d",
        razao_social: "LOGISTICA EXPRESS S.A.",
        cnae_descricao: "Transporte Rodoviário",
        situacao_cadastral: "Ativa",
        capital_social: 2500000,
        idade_anos: 8,
        socio_principal: "Roberto Costa",
    },
    {
        id: "bhqecj4p",
        razao_social: "MERCADINHO DA ESQUINA",
        cnae_descricao: "Comércio Varejista",
        situacao_cadastral: "Inapta",
        capital_social: 5000,
        idade_anos: 1,
        socio_principal: "Maria Oliveira",
    },
]

export const columns: ColumnDef<Company>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "razao_social",
        header: "Razão Social / Nome Fantasia",
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("razao_social")}</div>
        ),
    },
    {
        accessorKey: "cnae_descricao",
        header: "Setor / CNAE",
        cell: ({ row }) => (
            <div className="max-w-[200px] truncate" title={row.getValue("cnae_descricao")}>{row.getValue("cnae_descricao")}</div>
        ),
    },
    {
        accessorKey: "situacao_cadastral",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("situacao_cadastral") as string;
            let variant: "default" | "secondary" | "destructive" | "outline" = "outline";

            switch (status) {
                case "Ativa": variant = "default"; break; // Using default for green-ish if configured, or just default style
                case "Baixada": variant = "destructive"; break;
                case "Inapta": variant = "secondary"; break;
            }

            return <Badge variant={variant}>{status}</Badge>
        },
    },
    {
        accessorKey: "capital_social",
        header: () => <div className="text-right">Capital Social</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("capital_social"))

            // Format the amount as a dollar amount
            const formatted = new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
            }).format(amount)

            return <div className="text-right font-medium text-emerald-600">{formatted}</div>
        },
    },
    {
        accessorKey: "idade_anos",
        header: "Idade (Anos)",
        cell: ({ row }) => (
            <div className="text-center">{row.getValue("idade_anos")}</div>
        ),
    },
    {
        accessorKey: "socio_principal",
        header: "Sócio / Admin",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${row.getValue("socio_principal")}`} />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <span>{row.getValue("socio_principal")}</span>
            </div>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const payment = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(payment.id)}
                        >
                            Copy payment ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View customer</DropdownMenuItem>
                        <DropdownMenuItem>View payment details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

export function CompaniesTable() {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filtrar por Razão Social..."
                    value={(table.getColumn("razao_social")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("razao_social")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
