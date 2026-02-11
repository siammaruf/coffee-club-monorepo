import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import reportService from "~/services/httpServices/reportService";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [salesChart, setSalesChart] = useState<any>(null);
  const [expensesChart, setExpensesChart] = useState<any>(null);
  const [ApexChart, setApexChart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Chart filter states (shared for both charts)
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

  // Prepare sales chart data
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

  // Prepare expenses chart data
  const expensesChartCategories = expensesChart?.chartData?.map((d: any) => d.period) || [];
  const expensesChartSeries = [
    {
      name: "Expenses",
      data: expensesChart?.chartData?.map((d: any) => d.amount) || [],
    },
  ];

  // Filter UI as a component for reuse (ONE filter for both charts)
  const ChartFilter = (
    <div className="flex flex-wrap gap-2 mt-2">
      <select
        className="border rounded px-2 py-1 text-sm"
        value={chartPeriod}
        onChange={e => setChartPeriod(e.target.value as any)}
      >
        <option value="daily">Daily</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
      <select
        className="border rounded px-2 py-1 text-sm"
        value={chartFilterType}
        onChange={e => setChartFilterType(e.target.value as any)}
      >
        <option value="month">Month</option>
        <option value="year">Year</option>
        <option value="custom">Custom (Date Range)</option>
      </select>
      {(chartFilterType === "month" || chartFilterType === "year") && (
        <input
          className="border rounded px-2 py-1 text-sm"
          type="number"
          min={chartFilterType === "month" ? 1 : 2000}
          max={chartFilterType === "month" ? 12 : 2100}
          value={chartFilterValue}
          onChange={e => setChartFilterValue(e.target.value)}
          placeholder={chartFilterType === "month" ? "Month (1-12)" : "Year (YYYY)"}
          style={{ width: 110 }}
        />
      )}
      {chartFilterType === "custom" && (
        <>
          <input
            className="border rounded px-2 py-1 text-sm"
            type="date"
            value={chartStartDate}
            onChange={e => setChartStartDate(e.target.value)}
          />
          <input
            className="border rounded px-2 py-1 text-sm"
            type="date"
            value={chartEndDate}
            onChange={e => setChartEndDate(e.target.value)}
          />
          <div className="text-xs text-muted-foreground mt-1">
            Select a custom date range
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
      <p className="text-muted-foreground">
        Here's an overview of your coffee club activity
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.todays_total_sales !== undefined
                ? `৳${dashboard.todays_total_sales}`
                : "--"}
            </div>
            <p className="text-xs text-muted-foreground">Total sales for today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.todays_expenses !== undefined
                ? `৳${dashboard.todays_expenses}`
                : "--"}
            </div>
            <p className="text-xs text-muted-foreground">Total expenses for today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.todays_profit !== undefined
                ? `৳${dashboard.todays_profit}`
                : "--"}
            </div>
            <p className="text-xs text-muted-foreground">Profit for today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.total_orders_today ?? "--"}
            </div>
            <p className="text-xs text-muted-foreground">Orders placed today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.active_orders ?? "--"}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.pending_orders ?? "--"}
            </div>
            <p className="text-xs text-muted-foreground">Waiting to be processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.completed_orders ?? "--"}
            </div>
            <p className="text-xs text-muted-foreground">Finished today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.cancelled_orders ?? "--"}
            </div>
            <p className="text-xs text-muted-foreground">Cancelled today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Takeaway Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.takeaway_orders ?? "--"}
            </div>
            <p className="text-xs text-muted-foreground">Takeaway today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dine-in Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.dinein_orders ?? "--"}
            </div>
            <p className="text-xs text-muted-foreground">Dine-in today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.average_order_value !== undefined
                ? `৳${dashboard.average_order_value}`
                : "--"}
            </div>
            <p className="text-xs text-muted-foreground">Avg. value today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Generated At</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.generated_at
                ? new Date(dashboard.generated_at).toLocaleString()
                : "--"}
            </div>
            <p className="text-xs text-muted-foreground">Last updated</p>
          </CardContent>
        </Card>
      </div>

      {/* Place the filter ONCE above both charts */}
      <div className="mb-4">{ChartFilter}</div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Sales Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {ApexChart && salesChart ? (
              <>
                <ApexChart
                  type="line"
                  height={250}
                  options={{
                    chart: { id: "sales-progress" },
                    xaxis: { categories: salesChartCategories },
                    dataLabels: { enabled: false },
                    stroke: { curve: "smooth" },
                    colors: ["#2563eb", "#22c55e"],
                  }}
                  series={salesChartSeries}
                />
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-semibold">Total Sales:</span>{" "}
                    {salesChart?.summary?.totalSales !== undefined
                      ? `৳${salesChart.summary.totalSales}`
                      : "--"}
                  </div>
                  <div>
                    <span className="font-semibold">Total Orders:</span>{" "}
                    {salesChart?.summary?.totalOrders ?? "--"}
                  </div>
                  <div>
                    <span className="font-semibold">Avg. Sales:</span>{" "}
                    {salesChart?.summary?.averageSales !== undefined
                      ? `৳${salesChart.summary.averageSales}`
                      : "--"}
                  </div>
                  <div>
                    <span className="font-semibold">Growth Rate:</span>{" "}
                    {salesChart?.summary?.growthRate !== undefined
                      ? `${salesChart.summary.growthRate}%`
                      : "--"}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400">No sales chart data</div>
            )}
          </CardContent>
        </Card>

        {/* Expenses Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {ApexChart && expensesChart ? (
              <>
                <ApexChart
                  type="line"
                  height={250}
                  options={{
                    chart: { id: "expenses-progress" },
                    xaxis: { categories: expensesChartCategories },
                    dataLabels: { enabled: false },
                    stroke: { curve: "smooth" },
                    colors: ["#e11d48"],
                  }}
                  series={expensesChartSeries}
                />
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-semibold">Total Expenses:</span>{" "}
                    {expensesChart?.summary?.totalExpenses !== undefined
                      ? `৳${expensesChart.summary.totalExpenses}`
                      : "--"}
                  </div>
                  <div>
                    <span className="font-semibold">Total Transactions:</span>{" "}
                    {expensesChart?.summary?.totalTransactions ?? "--"}
                  </div>
                  <div>
                    <span className="font-semibold">Avg. Expense:</span>{" "}
                    {expensesChart?.summary?.averageExpense !== undefined
                      ? `৳${expensesChart.summary.averageExpense}`
                      : "--"}
                  </div>
                  <div>
                    <span className="font-semibold">Top Category:</span>{" "}
                    {expensesChart?.summary?.topCategory ?? "--"}
                  </div>
                </div>
                {expensesChart?.categoryBreakdown && expensesChart.categoryBreakdown.length > 0 && (
                  <div className="mt-4">
                    <div className="font-semibold mb-1 text-xs">Category Breakdown</div>
                    <div className="space-y-1">
                      {expensesChart.categoryBreakdown.map((cat: any) => (
                        <div key={cat.category} className="flex justify-between text-xs">
                          <span>{cat.category}</span>
                          <span>
                            ৳{cat.totalAmount} ({cat.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-400">No expenses chart data</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}