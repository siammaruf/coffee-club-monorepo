import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import reportService from "~/services/httpServices/reportService";
import type { FilteredReport, FilteredSummary, FinancialSummary } from "~/types/report";

export default function FinancialSummaryPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [filteredReports, setFilteredReports] = useState<FilteredReport[]>([]);
  const [filteredSummary, setFilteredSummary] = useState<FilteredSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);

  // Filter states
  const [filterType, setFilterType] = useState<'month' | 'year' | 'custom'>('month');
  const [filterValue, setFilterValue] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>(String(new Date().getFullYear()));
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Month names for dropdown
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Generate years for dropdown (last 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => String(currentYear - i));

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await reportService.getFinancialSummary();
      setSummary((res as any)?.data || null);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredSummary = async () => {
    setFilterLoading(true);
    try {
      const params: any = { filterType };
      if (filterType === "month") {
        params.filterValue = filterValue;
        params.filterYear = filterYear;
      }
      if (filterType === "year") {
        params.filterValue = filterYear;
      }
      if (filterType === "custom") {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const res = await reportService.getFilteredSummaryWithParams(params);
      const data = (res as any)?.data;
      setFilteredReports(data?.reports || []);
      setFilteredSummary(data?.summary || null);
    } catch {
      setFilteredReports([]);
      setFilteredSummary(null);
    } finally {
      setFilterLoading(false);
    }
  };

  // Button enabled only if filter is valid
  const isFilterValid =
    filterType === "month"
      ? !!filterValue && !!filterYear
      : filterType === "year"
      ? !!filterYear
      : filterType === "custom"
      ? !!startDate && !!endDate
      : false;

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading...</div>
          ) : (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-gray-50 rounded p-4 border">
                <div className="text-xs text-muted-foreground mb-1">Total Sales</div>
                <div className="text-2xl font-bold text-green-700">
                  ৳{summary?.total_sales ?? "--"}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-4 border">
                <div className="text-xs text-muted-foreground mb-1">Total Expenses</div>
                <div className="text-2xl font-bold text-red-700">
                  ৳{summary?.total_expenses ?? "--"}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-4 border">
                <div className="text-xs text-muted-foreground mb-1">Current Fund</div>
                <div className="text-2xl font-bold text-blue-700">
                  ৳{summary?.current_fund ?? "--"}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Filter Financial Reports</CardTitle>
          <div className="flex flex-wrap gap-2 mt-4 items-end">
            <select
              className="border rounded px-2 py-1 text-sm"
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
            >
              <option value="month">Month</option>
              <option value="year">Year</option>
              <option value="custom">Custom (Date Range)</option>
            </select>
            {filterType === "month" && (
              <>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={filterValue}
                  onChange={e => setFilterValue(e.target.value)}
                  style={{ width: 130 }}
                >
                  <option value="">Select Month</option>
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={filterYear}
                  onChange={e => setFilterYear(e.target.value)}
                  style={{ width: 100 }}
                >
                  <option value="">Year</option>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </>
            )}
            {filterType === "year" && (
              <select
                className="border rounded px-2 py-1 text-sm"
                value={filterYear}
                onChange={e => setFilterYear(e.target.value)}
                style={{ width: 100 }}
              >
                <option value="">Year</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            )}
            {filterType === "custom" && (
              <>
                <input
                  className="border rounded px-2 py-1 text-sm"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
                <input
                  className="border rounded px-2 py-1 text-sm"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Select a custom date range
                </div>
              </>
            )}
            <button
              className="ml-2 px-4 py-1 rounded bg-primary text-white text-sm disabled:opacity-50"
              disabled={!isFilterValid || filterLoading}
              onClick={fetchFilteredSummary}
              type="button"
            >
              {filterLoading ? "Filtering..." : "Apply Filter"}
            </button>
            {filteredSummary && (
              <button
                className="ml-2 px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs"
                onClick={() => {
                  setFilteredReports([]);
                  setFilteredSummary(null);
                }}
                type="button"
              >
                Clear Filter
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filterLoading ? (
            <div className="text-center text-gray-400 py-8">Loading filtered data...</div>
          ) : filteredSummary ? (
            <>
              {/* Summary Card */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div className="bg-gray-50 rounded p-4 border">
                  <div className="text-xs text-muted-foreground mb-1">Period</div>
                  <div className="text-base font-semibold">{filteredSummary.period}</div>
                </div>
                <div className="bg-gray-50 rounded p-4 border">
                  <div className="text-xs text-muted-foreground mb-1">Total Sales</div>
                  <div className="text-xl font-bold text-green-700">
                    ৳{filteredSummary.total_sales}
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-4 border">
                  <div className="text-xs text-muted-foreground mb-1">Total Expenses</div>
                  <div className="text-xl font-bold text-red-700">
                    ৳{filteredSummary.total_expenses}
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-4 border">
                  <div className="text-xs text-muted-foreground mb-1">Total Profit</div>
                  <div className="text-xl font-bold text-blue-700">
                    ৳{filteredSummary.total_profit}
                  </div>
                </div>
              </div>
              {/* Details Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">Date</th>
                      <th className="p-2 border">Total Sales</th>
                      <th className="p-2 border">Bar Sales</th>
                      <th className="p-2 border">Kitchen Sales</th>
                      <th className="p-2 border">Total Orders</th>
                      <th className="p-2 border">Bar Orders</th>
                      <th className="p-2 border">Kitchen Orders</th>
                      <th className="p-2 border">Total Expenses</th>
                      <th className="p-2 border">Expense Items</th>
                      <th className="p-2 border">Credit Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.length > 0 ? (
                      filteredReports.map((r) => (
                        <tr key={r.id}>
                          <td className="p-2 border">{r.report_date}</td>
                          <td className="p-2 border">৳{r.total_sales}</td>
                          <td className="p-2 border">৳{r.bar_sales}</td>
                          <td className="p-2 border">৳{r.kitchen_sales}</td>
                          <td className="p-2 border">{r.total_orders}</td>
                          <td className="p-2 border">{r.bar_orders}</td>
                          <td className="p-2 border">{r.kitchen_orders}</td>
                          <td className="p-2 border">৳{r.total_expenses}</td>
                          <td className="p-2 border">{r.total_expense_items}</td>
                          <td className="p-2 border">৳{r.credit_amount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="text-center text-gray-400 p-4">
                          No reports found for this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Extra summary info */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
                <div>
                  <strong>Best Sales Day:</strong> {filteredSummary.best_sales_day.date} (৳{filteredSummary.best_sales_day.amount})
                </div>
                <div>
                  <strong>Worst Sales Day:</strong> {filteredSummary.worst_sales_day.date} (৳{filteredSummary.worst_sales_day.amount})
                </div>
                <div>
                  <strong>Sales Trend:</strong> ↑ {filteredSummary.sales_trend.increasing_days} days, ↓ {filteredSummary.sales_trend.decreasing_days} days, = {filteredSummary.sales_trend.stable_days} days
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                <strong>Average Daily Sales:</strong> ৳{filteredSummary.average_daily_sales} | <strong>Average Daily Orders:</strong> {filteredSummary.average_daily_orders}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                <strong>Total Orders:</strong> {filteredSummary.total_orders} | <strong>Total Days:</strong> {filteredSummary.total_days}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400 py-8">No filter applied.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}