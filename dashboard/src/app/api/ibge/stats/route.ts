import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const ibgeCode = searchParams.get("ibge_code");

        if (!ibgeCode) {
            return NextResponse.json({ error: "ibge_code is required" }, { status: 400 });
        }

        // 1. Fetch Population (Census 2022 - Table 9514)
        const popUrl = `https://servicodados.ibge.gov.br/api/v3/agregados/9514/periodos/2022/variaveis/93?localidades=N6%5B${ibgeCode}%5D`;

        // 2. Fetch GDP (Table 5938) - PIB regular
        const pibUrl = `https://servicodados.ibge.gov.br/api/v3/agregados/5938/periodos/-1/variaveis/37?localidades=N6%5B${ibgeCode}%5D`;

        // 3. Fetch Employment & Salary (Table 1685 - CEMPRE)
        // Variable 707: Pessoal ocupado total
        // Variable 1606: Salário médio mensal
        const employmentUrl = `https://servicodados.ibge.gov.br/api/v3/agregados/1685/periodos/-1/variaveis/707%7C1606?localidades=N6%5B${ibgeCode}%5D`;

        const [popRes, pibRes, empRes] = await Promise.all([
            fetch(popUrl, { next: { revalidate: 86400 } }),
            fetch(pibUrl, { next: { revalidate: 86400 } }),
            fetch(employmentUrl, { next: { revalidate: 86400 } })
        ]);

        const popData = await popRes.json();
        const pibData = await pibRes.json();
        const empData = await empRes.json();

        // Helper to extract value from SIDRA array response safely
        const extractValue = (data: any, varId: number | string) => {
            if (!Array.isArray(data)) return "0";
            const variable = data.find(v => String(v.id) === String(varId));
            const val = variable?.resultados[0]?.series[0]?.serie;
            if (!val) return "0";
            // Get the latest year available in the serie object
            const latestYear = Object.keys(val).sort().pop();
            return latestYear ? val[latestYear] : "0";
        };

        const population = extractValue(popData, 93);
        const pibTotal = extractValue(pibData, 37);
        const totalJobs = extractValue(empData, 707);
        const avgSalary = extractValue(empData, 1606);

        // Manual calculation for PIB per capita if possible
        const nPop = Number(population);
        const nPib = Number(pibTotal) * 1000; // PIB is in 1000s
        const pibPerCapita = nPop > 0 ? (nPib / nPop) : 0;

        return NextResponse.json({
            population: nPop,
            pib: nPib,
            pib_per_capita: pibPerCapita,
            formal_jobs: Number(totalJobs),
            avg_salary: Number(avgSalary),
            year_pop: '2022'
        });
    } catch (error: any) {
        console.error("IBGE API Proxy Error:", error.message);
        return NextResponse.json({
            error: "Failed to fetch IBGE data",
            details: error.message
        }, { status: 500 });
    }
}
