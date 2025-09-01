import type { ProcessingRequest } from "../lib/types";

// Sample test data based on the BCRA scraping result you provided
export const sampleScrapingResponse: ProcessingRequest = {
  scrapingResponse: {
    success: true,
    timestamp: "2025-08-31T16:19:09.708Z",
    sitesProcessed: 1,
    totalSitesConfigured: 1,
    results: [
      {
        name: "🪙 Variables económicas, monetarias y cambiarias del Banco Central de la República Argentina.",
        url: "https://www.lamacro.ar/variables",
        title: "Estadísticas BCRA | La Macro",
        content: `Se actualiza una vez por díaEstadísticas BCRAVariables económicas, monetarias y cambiarias del Banco Central de la República Argentina.Exportar a ExcelExcelInflaciónÚlt. act: 31/07/2025Inflación mensual (variación en %)1,90%Últ. act: 31/07/2025Inflación interanual (variación en % i.a.)36,60%Últ. act: 31/07/2025Inflación esperada - REM próximos 12 meses - MEDIANA (variación en % i.a)21,10%DivisasÚlt. act: 27/08/2025Reservas Internacionales del BCRA (en millones de dólares - cifras provisorias sujetas a cambio de valuación)41.255Últ. act: 29/08/2025Tipo de Cambio Minorista ($ por USD) Comunicación B 9791 - Promedio vendedor1.361,42Últ. act: 29/08/2025Tipo de Cambio Mayorista ($ por USD) Comunicación A 3500 - Referencia1.323,83Tasas de InterésÚlt. act: 28/08/2025TAMAR en pesos de bancos privados (en % TNA)66,13%Últ. act: 28/08/2025TAMAR en pesos de bancos privados (en % TEA)90,18%Últ. act: 28/08/2025BADLAR en pesos de bancos privados (en % TNA)59,06%Últ. act: 28/08/2025BADLAR en pesos de bancos privados (en % TEA)77,86%Últ. act: 28/08/2025TM20 en pesos de bancos privados (en % TNA)61,63%Últ. act: 29/08/2025Tasas de interés de las operaciones de pase activas para el BCRA, a 1 día de plazo (en % TNA)33%Últ. act: 28/08/2025Tasas de interés por préstamos entre entidades financiera privadas (BAIBAR) (en % TNA)65,61%Últ. act: 28/08/2025Tasas de interés por depósitos a 30 días de plazo en entidades financieras (en % TNA)55,63%Últ. act: 28/08/2025Tasa de interés de préstamos por adelantos en cuenta corriente81,44%Últ. act: 28/08/2025Tasa de interés de préstamos personales77,37%Últ. act: 31/08/2025Tasa de interés para uso de la Justicia – Comunicado P 14290 | Base 01/04/1991 (en %)21.289,30%Base MonetariaÚlt. act: 27/08/2025Base monetaria - Total (en millones de pesos)44.202.019Últ. act: 27/08/2025Circulación monetaria (en millones de pesos)23.604.996Últ. act: 27/08/2025Billetes y monedas en poder del público (en millones de pesos)21.482.307Últ. act: 27/08/2025Efectivo en entidades financieras (en millones de pesos)2.122.689Últ. act: 27/08/2025Depósitos de los bancos en cta. cte. en pesos en el BCRA (en millones de pesos)20.597.023DepósitosÚlt. act: 27/08/2025Depósitos en efectivo en las entidades financieras - Total (en millones de pesos)177.549.325Últ. act: 27/08/2025En cuentas corrientes (neto de utilización FUCO) (en millones de pesos)29.593.416Últ. act: 27/08/2025En Caja de ahorros (en millones de pesos)61.335.873Últ. act: 27/08/2025A plazo (incluye inversiones y excluye CEDROS) (en millones de pesos)76.084.781ÍndicesÚlt. act: 31/08/2025CER (Base 2.2.2002=1)622,15Últ. act: 31/08/2025Unidad de Valor Adquisitivo (UVA) (en pesos -con dos decimales-, base 31.3.2016=14.05)1.569,24Últ. act: 31/08/2025Unidad de Vivienda (UVI) (en pesos -con dos decimales-, base 31.3.2016=14.05)1.154,24Últ. act: 31/08/2025Índice para Contratos de Locación (ICL-Ley 27.551, con dos decimales, base 30.6.20=1)27,12PrivadosÚlt. act: 27/08/2025M2 privado, promedio móvil de 30 días, variación interanual (en %)-2,20%Últ. act: 27/08/2025Préstamos de las entidades financieras al sector privado (en millones de pesos)104.630.629`,
        contentLength: 2616,
        scrapedAt: "2025-08-31T16:19:09.708Z",
        keywords: [
          "dólar",
          "inflación",
          "tasa de interés",
          "Reservas Internacionales",
          "Tipo de cambio mayorista",
        ],
        status: "success" as const,
        id: "qsvapi-ogbf9i",
        domain: "lamacro.ar",
        wordCount: 449,
      },
    ],
    executionTime: 2616,
  },
  options: {
    generateEmbeddings: true,
    extractKeywords: true,
    structureContent: true,
    model: "gpt-4o-mini",
  },
};

// Sample processing options for testing different configurations
export const testConfigurations = {
  minimal: {
    generateEmbeddings: false,
    extractKeywords: true,
    structureContent: true,
    model: "gpt-4o-mini",
  },
  fullProcessing: {
    generateEmbeddings: true,
    extractKeywords: true,
    structureContent: true,
    model: "gpt-4o-mini",
  },
  embeddingsOnly: {
    generateEmbeddings: true,
    extractKeywords: false,
    structureContent: false,
    model: "gpt-4o-mini",
  },
};
