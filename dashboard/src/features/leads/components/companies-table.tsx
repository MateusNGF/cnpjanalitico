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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Mail, Phone, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
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

export type Company = {
    cnpj_full: string
    razao_social: string
    nome_fantasia: string
    cnae_descricao: string
    bairro: string
    municipio: string
    situacao_cadastral: string
    porte: string
    capital_social: number
    data_inicio_atividade: string
    idade_anos: number
    idade_meses: number
}

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
        header: "Identificação",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <div className="font-semibold text-sm truncate max-w-[250px]" title={row.original.razao_social}>
                    {row.original.nome_fantasia || row.original.razao_social}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                    {row.original.cnpj_full.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")}
                </div>
            </div>
        ),
    },
    {
        id: "tags",
        header: "Maturidade",
        cell: ({ row }) => {
            const isHot = row.original.idade_meses <= 1
            const isNew = row.original.idade_anos < 1

            return (
                <div className="flex flex-wrap gap-1">
                    {isHot && (
                        <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-200 text-[10px] px-1.5 py-0">
                            Hot 🔥
                        </Badge>
                    )}
                    {isNew && !isHot && (
                        <Badge variant="outline" className="text-blue-600 border-blue-200 text-[10px] px-1.5 py-0">
                            Nova
                        </Badge>
                    )}
                    <Badge variant="ghost" className="text-[10px] px-1.5 py-0 font-normal">
                        {row.original.idade_anos} {row.original.idade_anos === 1 ? 'ano' : 'anos'}
                    </Badge>
                </div>
            )
        }
    },
    {
        accessorKey: "cnae_descricao",
        header: "Atividade",
        cell: ({ row }) => (
            <div className="max-w-[180px] text-xs leading-tight" title={row.getValue("cnae_descricao")}>
                {row.getValue("cnae_descricao")}
            </div>
        ),
    },
    {
        accessorKey: "bairro",
        header: "Localização",
        cell: ({ row }) => (
            <div>
                <div className="font-medium text-xs truncate max-w-[120px]">{row.getValue("bairro")}</div>
                <div className="text-[10px] text-muted-foreground">{row.original.municipio}</div>
            </div>
        )
    },
    {
        accessorKey: "situacao_cadastral",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("situacao_cadastral") as string;
            let className = "";

            switch (status) {
                case "02": // Ativa
                    className = "bg-emerald-500/10 text-emerald-600 border-emerald-200";
                    break;
                case "08": // Baixada
                    className = "bg-red-500/10 text-red-600 border-red-200";
                    break;
                default:
                    className = "bg-amber-500/10 text-amber-600 border-amber-200";
            }

            return <Badge variant="outline" className={cn("text-[10px] uppercase font-bold", className)}>
                {status === "02" ? "Ativa" : status === "08" ? "Baixada" : "OUTRA"}
            </Badge>
        },
    },
    {
        accessorKey: "porte",
        header: "Porte",
        cell: ({ row }) => (
            <Badge variant="secondary" className="text-[10px] font-medium bg-secondary/50 truncate max-w-[100px]">
                {row.getValue("porte")}
            </Badge>
        ),
    },
    {
        id: "contact",
        header: "Ações Rápidas",
        cell: ({ row }) => (
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700">
                    <MessageCircle className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                    <Mail className="h-3.5 w-3.5" />
                </Button>
            </div>
        ),
    },
    {
        accessorKey: "capital_social",
        header: () => <div className="text-right">Capital Social</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("capital_social"))
            const formatted = new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
            }).format(amount)

            return <div className="text-right font-medium text-xs">{formatted}</div>
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem>Ver Detalhes do CNPJ</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Ver Sócios</DropdownMenuItem>
                        <DropdownMenuItem>Rastrear Endereço</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

import { useFilterStore } from "@/store/use-filter-store"
import { useDataStore } from "@/store/use-data-store"
import { useEffect } from "react"

export function CompaniesTable() {
    const filters = useFilterStore()
    const { data: leads, loading } = useDataStore(s => s.leads)
    const fetchLeads = useDataStore(s => s.fetchLeads)

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    useEffect(() => {
        fetchLeads(filters)
    }, [filters, fetchLeads])

    const tableData = React.useMemo(() => leads || [], [leads])

    const table = useReactTable({
        data: tableData,
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
                    placeholder="Buscar por Razão Social..."
                    value={(table.getColumn("razao_social")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("razao_social")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Colunas <ChevronDown />
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
                                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                                    onClick={() => filters.setSelectedCnpj(row.original.cnpj_full)}
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
                                    Nenhum resultado encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} de{" "}
                    {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Próxima
                    </Button>
                </div>
            </div>
        </div>
    )
}
