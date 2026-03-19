import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import reportService from "~/services/httpServices/reportService";
import DataManagementPage from "./data-management/index";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  UtensilsCrossed,
  BarChart3,
  CalendarClock,
} from "lucide-react";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className={`rounded-lg p-2.5 ${iconBg}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const location = useLocation();
  const tab = new URLSearchParams(location.search).get("tab");

  const [dashboard, setDashboard] = useState<any>(null);
  const [salesChart, setSalesChart] = useState<any>(null);
  const [expensesChart, setExpensesChart] = useState<any>(null);
  const [ApexChart, setApexChart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [chartPeriod, setChartPeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [chartFilterType, setChartFilterType] = useState<'month' | 'year' | 'custom'>('month');
  const [chartFilterValue, setChartFilterValue] = useState<string>(`${new Date().getMonth() + 1}`);
  const [chartStartDate, setChartStartDate] = useState<string>("");
  const [chartEndDate, setChartEndDate] = useState<string>("");

  useEffect(() => {
    fetchDashboard();
    import("react-apexcharts").then((mod) => setApexChart(() => mod.default));
  }, []);

  useEffect(() => {
    fetchSalesChart();
    fetchExpensesChart();
    // eslint-disable-next-line
  }, [chartPeriod, chartFilterType, chartFilterValue, chartStartDate, chartEndDate]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await reportService.getDashboard() as { data: any };
      setDashboard(res.data);
    } catch {
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesChart = async () => {
    try {
      const params: any = {
        period: chartPeriod,
        filterType: chartFilterType,
      };
      if (chartFilterType === "month" || chartFilterType === "year") {
        params.filterValue = chartFilterValue;
      }
      if (chartFilterType === "custom") {
        params.startDate = chartStartDate;
        params.endDate = chartEndDate;
      }
      const salesRes = await reportService.getSalesProgressChart(params) as { data: any };
      setSalesChart(salesRes.data);
    } catch {
      setSalesChart(null);
    }
  };

  const fetchExpensesChart = async () => {
    try {
      const params: any = {
        period: chartPeriod,
        filterType: chartFilterType,
      };
      if (chartFilterType === "month" || chartFilterType === "year") {
        params.filterValue = chartFilterValue;
      }
      if (chartFilterType === "custom") {
        params.startDate = chartStartDate;
        params.endDate = chartEndDate;
      }
      const expensesRes = await reportService.getExpensesChart(params) as { data: any };
      setExpensesChart(expensesRes.data);
    } catch {
      setExpensesChart(null);
    }
  };

  const salesChartCategories = salesChart?.chartData?.map((d: any) => d.period) || [];
  const salesChartSeries = [
    {
      name: "Sales",
      data: salesChart?.chartData?.map((d: any) => d.sales) || [],
    },
    {
      name: "Orders",
      data: salesChart?.chartData?.map((d: any) => d.orders) || [],
    },
  ];

  const expensesChartCategories = expensesChart?.chartData?.map((d: any) => d.period) || [];
  const expensesChartSeries = [
    {
      name: "Expenses",
      data: expensesChart?.chartData?.map((d: any) => d.amount) || [],
    },
  ];

  const selectClass = "rounded-lg border bg-background px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/20";
  const inputClass = "rounded-lg border bg-background px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/20";

  const ChartFilter = (
    <div className="flex flex-wrap items-center gap-2">
      <select className={selectClass} value={chartPeriod} onChange={e => setChartPeriod(e.target.value as any)}>
        <option value="daily">Daily</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
      <select className={selectClass} value={chartFilterType} onChange={e => setChartFilterType(e.target.value as any)}>
        <option value="month">Month</option>
        <option value="year">Year</option>
        <option value="custom">Custom Range</option>
      </select>
      {(chartFilterType === "month" || chartFilterType === "year") && (
        <input
          className={`${inputClass} w-28`}
          type="number"
          min={chartFilterType === "month" ? 1 : 2000}
          max={chartFilterType === "month" ? 12 : 2100}
          value={chartFilterValue}
          onChange={e => setChartFilterValue(e.target.value)}
          placeholder={chartFilterType === "month" ? "Month (1-12)" : "Year"}
        />
      )}
      {chartFilterType === "custom" && (
        <>
          <input className={inputClass} type="date" value={chartStartDate} onChange={e => setChartStartDate(e.target.value)} />
          <span className="text-muted-foreground text-sm">to</span>
          <input className={inputClass} type="date" value={chartEndDate} onChange={e => setChartEndDate(e.target.value)} />
        </>
      )}
    </div>
  );

  if (tab === "data-management" || tab === "export" || tab === "import" || tab === "backup") {
    return <DataManagementPage />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your coffee club activity
        </p>
      </div>

      {/* Today's Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Sales"
          value={dashboard?.todays_total_sales !== undefined ? `৳${dashboard.todays_total_sales}` : "--"}
          subtitle="Total sales for today"
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
        />
        <StatCard
          title="Today's Expenses"
          value={dashboard?.todays_expenses !== undefined ? `৳${dashboard.todays_expenses}` : "--"}
          subtitle="Total expenses for today"
          icon={TrendingUp}
          iconColor="text-red-600"
          iconBg="bg-red-100"
        />
        <StatCard
          title="Today's Profit"
          value={dashboard?.todays_profit !== undefined ? `৳${dashboard.todays_profit}` : "--"}
          subtitle="Profit for today"
          icon={BarChart3}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Total Orders Today"
          value={dashboard?.total_orders_today ?? "--"}
          subtitle="Orders placed today"
          icon={ShoppingCart}
          iconColor="text-violet-600"
          iconBg="bg-violet-100"
        />
      </div>

      {/* Order Status */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Orders"
          value={dashboard?.active_orders ?? "--"}
          subtitle="Currently active"
          icon={Loader2}
          iconColor="text-amber-600"
          iconBg="bg-amber-100"
        />
        <StatCard
          title="Pending Orders"
          value={dashboard?.pending_orders ?? "--"}
          subtitle="Waiting to be processed"
          icon={Clock}
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
        />
        <StatCard
          title="Completed Orders"
          value={dashboard?.completed_orders ?? "--"}
          subtitle="Finished today"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
        />
        <StatCard
          title="Cancelled Orders"
          value={dashboard?.cancelled_orders ?? "--"}
          subtitle="Cancelled today"
          icon={XCircle}
          iconColor="text-red-600"
          iconBg="bg-red-100"
        />
      </div>

      {/* Order Details */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Takeaway Orders"
          value={dashboard?.takeaway_orders ?? "--"}
          subtitle="Takeaway today"
          icon={ShoppingBag}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-100"
        />
        <StatCard
          title="Dine-in Orders"
          value={dashboard?.dinein_orders ?? "--"}
          subtitle="Dine-in today"
          icon={UtensilsCrossed}
          iconColor="text-pink-600"
          iconBg="bg-pink-100"
        />
        <StatCard
          title="Average Order Value"
          value={dashboard?.average_order_value !== undefined ? `৳${dashboard.average_order_value}` : "--"}
          subtitle="Avg. value today"
          icon={DollarSign}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-100"
        />
        <StatCard
          title="Last Updated"
          value={dashboard?.generated_at ? new Date(dashboard.generated_at).toLocaleTimeString() : "--"}
          subtitle={dashboard?.generated_at ? new Date(dashboard.generated_at).toLocaleDateString() : "Last updated"}
          icon={CalendarClock}
          iconColor="text-slate-600"
          iconBg="bg-slate-100"
        />
      </div>

      {/* Chart Filters */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Analytics</h3>
            {ChartFilter}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {ApexChart && salesChart ? (
              <>
                <ApexChart
                  type="area"
                  height={250}
                  options={{
                    chart: { id: "sales-progress", toolbar: { show: false }, sparkline: { enabled: false } },
                    xaxis: { categories: salesChartCategories, labels: { style: { fontSize: "11px" } } },
                    yaxis: { labels: { style: { fontSize: "11px" } } },
                    dataLabels: { enabled: false },
                    stroke: { curve: "smooth", width: 2 },
                    colors: ["#2563eb", "#22c55e"],
                    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05 } },
                    grid: { borderColor: "#f1f1f1", strokeDashArray: 4 },
                    tooltip: { theme: "light" },
                  }}
                  series={salesChartSeries}
                />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Total Sales</p>
                    <p className="text-sm font-semibold">{salesChart?.summary?.totalSales !== undefined ? `৳${salesChart.summary.totalSales}` : "--"}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Total Orders</p>
                    <p className="text-sm font-semibold">{salesChart?.summary?.totalOrders ?? "--"}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Avg. Sales</p>
                    <p className="text-sm font-semibold">{salesChart?.summary?.averageSales !== undefined ? `৳${salesChart.summary.averageSales}` : "--"}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Growth Rate</p>
                    <p className="text-sm font-semibold">{salesChart?.summary?.growthRate !== undefined ? `${salesChart.summary.growthRate}%` : "--"}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                No sales chart data
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expenses Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {ApexChart && expensesChart ? (
              <>
                <ApexChart
                  type="area"
                  height={250}
                  options={{
                    chart: { id: "expenses-progress", toolbar: { show: false } },
                    xaxis: { categories: expensesChartCategories, labels: { style: { fontSize: "11px" } } },
                    yaxis: { labels: { style: { fontSize: "11px" } } },
                    dataLabels: { enabled: false },
                    stroke: { curve: "smooth", width: 2 },
                    colors: ["#e11d48"],
                    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05 } },
                    grid: { borderColor: "#f1f1f1", strokeDashArray: 4 },
                    tooltip: { theme: "light" },
                  }}
                  series={expensesChartSeries}
                />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Total Expenses</p>
                    <p className="text-sm font-semibold">{expensesChart?.summary?.totalExpenses !== undefined ? `৳${expensesChart.summary.totalExpenses}` : "--"}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Transactions</p>
                    <p className="text-sm font-semibold">{expensesChart?.summary?.totalTransactions ?? "--"}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Avg. Expense</p>
                    <p className="text-sm font-semibold">{expensesChart?.summary?.averageExpense !== undefined ? `৳${expensesChart.summary.averageExpense}` : "--"}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Top Category</p>
                    <p className="text-sm font-semibold truncate">{expensesChart?.summary?.topCategory ?? "--"}</p>
                  </div>
                </div>
                {expensesChart?.categoryBreakdown && expensesChart.categoryBreakdown.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Category Breakdown</p>
                    <div className="space-y-1.5">
                      {expensesChart.categoryBreakdown.map((cat: any) => (
                        <div key={cat.category} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{cat.category}</span>
                          <span className="font-medium">
                            ৳{cat.totalAmount} <span className="text-xs text-muted-foreground">({cat.percentage}%)</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                No expenses chart data
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
