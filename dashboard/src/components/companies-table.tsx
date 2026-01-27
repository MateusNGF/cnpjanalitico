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
    id: string
    cnpj: string
    razao_social: string
    nome_fantasia: string
    cnae_descricao: string
    bairro: string
    municipio: string
    situacao_cadastral: "Ativa" | "Baixada" | "Inapta" | "Suspensa"
    porte: "MEI" | "ME" | "EPP" | "DEMAIS"
    capital_social: number
}

const data: Company[] = [
    {
        id: "m5gr84i9",
        cnpj: "12.345.678/0001-99",
        razao_social: "TECH SOLUTIONS LTDA",
        nome_fantasia: "TechSol",
        cnae_descricao: "Desenvolvimento de Software",
        bairro: "Savassi",
        municipio: "Belo Horizonte",
        situacao_cadastral: "Ativa",
        porte: "EPP",
        capital_social: 150000,
    },
    {
        id: "3u1re74j",
        cnpj: "98.765.432/0001-11",
        razao_social: "PADARIA DO JOAO ME",
        nome_fantasia: "Padaria do João",
        cnae_descricao: "Panificação",
        bairro: "Centro",
        municipio: "Divinópolis",
        situacao_cadastral: "Ativa",
        porte: "ME",
        capital_social: 10000,
    },
    {
        id: "derv1ws0",
        cnpj: "11.222.333/0001-44",
        razao_social: "CONSULTORIA EMPRESARIAL XYZ",
        nome_fantasia: "XYZ Consultoria",
        cnae_descricao: "Consultoria em Gestão",
        bairro: "Lourdes",
        municipio: "Belo Horizonte",
        situacao_cadastral: "Baixada",
        porte: "ME",
        capital_social: 50000,
    },
    {
        id: "5k8821d",
        cnpj: "55.444.333/0001-22",
        razao_social: "LOGISTICA EXPRESS S.A.",
        nome_fantasia: "LogExpress",
        cnae_descricao: "Transporte Rodoviário",
        bairro: "Distrito Industrial",
        municipio: "Betim",
        situacao_cadastral: "Ativa",
        porte: "DEMAIS",
        capital_social: 2500000,
    },
    {
        id: "bhqecj4p",
        cnpj: "99.888.777/0001-00",
        razao_social: "MERCADINHO DA ESQUINA",
        nome_fantasia: "Mercadinho",
        cnae_descricao: "Comércio Varejista",
        bairro: "Santa Tereza",
        municipio: "Belo Horizonte",
        situacao_cadastral: "Inapta",
        porte: "MEI",
        capital_social: 5000,
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
        header: "Identificação (Nome / CNPJ)",
        cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.original.nome_fantasia || row.original.razao_social}</div>
                <div className="text-xs text-muted-foreground">{row.original.cnpj}</div>
            </div>
        ),
    },
    {
        accessorKey: "cnae_descricao",
        header: "Atividade Principal",
        cell: ({ row }) => (
            <div className="max-w-[200px] truncate" title={row.getValue("cnae_descricao")}>{row.getValue("cnae_descricao")}</div>
        ),
    },
    {
        accessorKey: "bairro",
        header: "Localização",
        cell: ({ row }) => (
            <div>
                <div className="font-medium text-xs">{row.getValue("bairro")}</div>
                <div className="text-[10px] text-muted-foreground">{row.original.municipio}</div>
            </div>
        )
    },
    {
        accessorKey: "situacao_cadastral",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("situacao_cadastral") as string;
            let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
            let className = "";

            switch (status) {
                case "Ativa":
                    variant = "default";
                    className = "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200";
                    break;
                case "Baixada":
                    variant = "destructive";
                    className = "bg-red-100 text-red-800 hover:bg-red-100 border-red-200";
                    break;
                case "Inapta":
                case "Suspensa":
                    variant = "secondary";
                    className = "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200";
                    break;
            }

            return <Badge variant="outline" className={className}>{status}</Badge>
        },
    },
    {
        accessorKey: "porte",
        header: "Porte",
        cell: ({ row }) => (
            <div className="text-center font-medium text-xs">{row.getValue("porte")}</div>
        ),
    },
    {
        id: "contact",
        header: "Contato Rápido",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600">
                    <MessageCircle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                    <Mail className="h-4 w-4" />
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
