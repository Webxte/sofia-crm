
import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear,
  format, subWeeks, subMonths, eachWeekOfInterval, eachMonthOfInterval,
  isWithinInterval, parseISO,
} from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useMeetings } from "@/context/meetings";
import { useOrders } from "@/context/orders/OrdersContext";
import { useContacts } from "@/context/contacts/ContactsContext";
import { useTasks } from "@/context/tasks";
import { Meeting, Order, Contact, Task } from "@/types";
import {
  CalendarDays, TrendingUp, Users, CheckCircle2, Euro, ShoppingCart,
  Phone, Target, Clock,
} from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

type Period = "weekly" | "monthly" | "yearly";

const MyPerformance = () => {
  const { user } = useAuth();
  const { meetings } = useMeetings();
  const { orders } = useOrders();
  const { contacts } = useContacts();
  const { tasks } = useTasks();

  // All data is already scoped to the user via RLS, but filter by agentId for extra safety
  const myMeetings = useMemo(() => meetings.filter(m => m.agentId === user?.id), [meetings, user?.id]);
  const myOrders = useMemo(() => orders.filter(o => o.agentId === user?.id), [orders, user?.id]);
  const myContacts = useMemo(() => contacts.filter(c => c.agentId === user?.id), [contacts, user?.id]);
  const myTasks = useMemo(() => tasks.filter(t => t.agentId === user?.id), [tasks, user?.id]);

  // ---- KPI Cards ----
  const kpis = useMemo(() => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisMonthStart = startOfMonth(now);
    const thisYearStart = startOfYear(now);

    const meetingsThisWeek = myMeetings.filter(m => new Date(m.date) >= thisWeekStart).length;
    const meetingsThisMonth = myMeetings.filter(m => new Date(m.date) >= thisMonthStart).length;
    const meetingsThisYear = myMeetings.filter(m => new Date(m.date) >= thisYearStart).length;

    const ordersThisMonth = myOrders.filter(o => new Date(o.date) >= thisMonthStart);
    const revenueThisMonth = ordersThisMonth.reduce((s, o) => s + o.total, 0);
    const revenueThisYear = myOrders
      .filter(o => new Date(o.date) >= thisYearStart)
      .reduce((s, o) => s + o.total, 0);

    const totalRevenue = myOrders.reduce((s, o) => s + o.total, 0);
    const avgOrderValue = myOrders.length > 0 ? totalRevenue / myOrders.length : 0;

    const completedTasks = myTasks.filter(t => t.status === "completed").length;
    const taskCompletionRate = myTasks.length > 0 ? (completedTasks / myTasks.length) * 100 : 0;

    const newContactsThisMonth = myContacts.filter(c => new Date(c.createdAt) >= thisMonthStart).length;

    return {
      meetingsThisWeek, meetingsThisMonth, meetingsThisYear,
      ordersThisMonth: ordersThisMonth.length,
      revenueThisMonth, revenueThisYear, totalRevenue, avgOrderValue,
      totalContacts: myContacts.length, newContactsThisMonth,
      completedTasks, totalTasks: myTasks.length, taskCompletionRate,
      totalMeetings: myMeetings.length, totalOrders: myOrders.length,
    };
  }, [myMeetings, myOrders, myContacts, myTasks]);

  // ---- Time series helpers ----
  const meetingsByPeriod = useMemo(() => buildTimeSeries(myMeetings, "date"), [myMeetings]);
  const ordersByPeriod = useMemo(() => buildOrderTimeSeries(myOrders), [myOrders]);
  const contactsByPeriod = useMemo(() => buildTimeSeries(myContacts, "createdAt"), [myContacts]);

  // ---- Meeting type breakdown ----
  const meetingTypeData = useMemo(() => {
    const map: Record<string, number> = {};
    myMeetings.forEach(m => { map[m.type] = (map[m.type] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [myMeetings]);

  // ---- Order status breakdown ----
  const orderStatusData = useMemo(() => {
    const map: Record<string, number> = {};
    myOrders.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), value,
    }));
  }, [myOrders]);

  // ---- Task priority breakdown ----
  const taskPriorityData = useMemo(() => {
    const map: Record<string, number> = {};
    myTasks.forEach(t => { map[t.priority] = (map[t.priority] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), value,
    }));
  }, [myTasks]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">My Performance</h2>
        <p className="text-muted-foreground">Your personal work summary and KPIs</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<Euro className="h-4 w-4" />} title="Revenue This Month" value={`€${kpis.revenueThisMonth.toFixed(2)}`} sub={`€${kpis.revenueThisYear.toFixed(2)} this year`} />
        <KpiCard icon={<ShoppingCart className="h-4 w-4" />} title="Orders This Month" value={kpis.ordersThisMonth.toString()} sub={`${kpis.totalOrders} total · Avg €${kpis.avgOrderValue.toFixed(2)}`} />
        <KpiCard icon={<CalendarDays className="h-4 w-4" />} title="Meetings This Week" value={kpis.meetingsThisWeek.toString()} sub={`${kpis.meetingsThisMonth} this month · ${kpis.meetingsThisYear} this year`} />
        <KpiCard icon={<Users className="h-4 w-4" />} title="My Contacts" value={kpis.totalContacts.toString()} sub={`${kpis.newContactsThisMonth} new this month`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<CheckCircle2 className="h-4 w-4" />} title="Task Completion" value={`${kpis.taskCompletionRate.toFixed(0)}%`} sub={`${kpis.completedTasks}/${kpis.totalTasks} tasks`} />
        <KpiCard icon={<TrendingUp className="h-4 w-4" />} title="Total Revenue" value={`€${kpis.totalRevenue.toFixed(2)}`} sub={`Across ${kpis.totalOrders} orders`} />
        <KpiCard icon={<Phone className="h-4 w-4" />} title="Total Meetings" value={kpis.totalMeetings.toString()} sub={`${meetingTypeData.length} different types`} />
        <KpiCard icon={<Target className="h-4 w-4" />} title="Avg Order Value" value={`€${kpis.avgOrderValue.toFixed(2)}`} sub={`Based on ${kpis.totalOrders} orders`} />
      </div>

      {/* Detailed Charts */}
      <Tabs defaultValue="revenue">
        <TabsList className="flex-wrap">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <PeriodChartCard
            title="Revenue Over Time"
            description="Your sales revenue aggregated by period"
            data={ordersByPeriod}
            dataKey="revenue"
            formatter={(v: number) => `€${v.toFixed(2)}`}
            color="#8884d8"
            type="bar"
          />
          <PeriodChartCard
            title="Orders Over Time"
            description="Number of orders you created per period"
            data={ordersByPeriod}
            dataKey="count"
            formatter={(v: number) => `${v} orders`}
            color="#00C49F"
            type="area"
          />
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <PeriodChartCard
            title="Meetings Over Time"
            description="Number of meetings you held per period"
            data={meetingsByPeriod}
            dataKey="count"
            formatter={(v: number) => `${v} meetings`}
            color="#0088FE"
            type="bar"
          />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <PeriodChartCard
            title="New Contacts Over Time"
            description="Contacts you added per period"
            data={contactsByPeriod}
            dataKey="count"
            formatter={(v: number) => `${v} contacts`}
            color="#FFBB28"
            type="area"
          />
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PieChartCard title="Meeting Types" data={meetingTypeData} />
            <PieChartCard title="Order Status" data={orderStatusData} />
            <PieChartCard title="Task Priority" data={taskPriorityData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ---- Helper Components ----

const KpiCard = ({ icon, title, value, sub }: { icon: React.ReactNode; title: string; value: string; sub: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <span className="text-muted-foreground">{icon}</span>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </CardContent>
  </Card>
);

const PeriodChartCard = ({
  title, description, data, dataKey, formatter, color, type,
}: {
  title: string; description: string;
  data: { weekly: any[]; monthly: any[]; yearly: any[] };
  dataKey: string; formatter: (v: number) => string;
  color: string; type: "bar" | "line" | "area";
}) => {
  const [period, setPeriod] = React.useState<Period>("monthly");
  const chartData = data[period];

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex gap-1">
          {(["weekly", "monthly", "yearly"] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {type === "bar" ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value: number) => [formatter(value), title]} />
                  <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value: number) => [formatter(value), title]} />
                  <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.2} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PieChartCard = ({ title, data }: { title: string; data: { name: string; value: number }[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-52">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" outerRadius={70} dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">No data</div>
        )}
      </div>
    </CardContent>
  </Card>
);

// ---- Data aggregation helpers ----

function buildTimeSeries(items: any[], dateField: string) {
  const now = new Date();

  // Weekly: last 12 weeks
  const weekStarts = eachWeekOfInterval(
    { start: subWeeks(now, 11), end: now },
    { weekStartsOn: 1 }
  );
  const weekly = weekStarts.map(ws => {
    const we = endOfWeek(ws, { weekStartsOn: 1 });
    const count = items.filter(i => {
      const d = new Date(i[dateField]);
      return isWithinInterval(d, { start: ws, end: we });
    }).length;
    return { label: format(ws, "dd MMM"), count };
  });

  // Monthly: last 12 months
  const monthStarts = eachMonthOfInterval({ start: subMonths(now, 11), end: now });
  const monthly = monthStarts.map(ms => {
    const me = endOfMonth(ms);
    const count = items.filter(i => {
      const d = new Date(i[dateField]);
      return isWithinInterval(d, { start: ms, end: me });
    }).length;
    return { label: format(ms, "MMM yy"), count };
  });

  // Yearly: group by year
  const yearMap: Record<string, number> = {};
  items.forEach(i => {
    const y = new Date(i[dateField]).getFullYear().toString();
    yearMap[y] = (yearMap[y] || 0) + 1;
  });
  const yearly = Object.entries(yearMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([label, count]) => ({ label, count }));

  return { weekly, monthly, yearly };
}

function buildOrderTimeSeries(orders: Order[]) {
  const now = new Date();

  const weekStarts = eachWeekOfInterval(
    { start: subWeeks(now, 11), end: now },
    { weekStartsOn: 1 }
  );
  const weekly = weekStarts.map(ws => {
    const we = endOfWeek(ws, { weekStartsOn: 1 });
    const matched = orders.filter(o => {
      const d = new Date(o.date);
      return isWithinInterval(d, { start: ws, end: we });
    });
    return { label: format(ws, "dd MMM"), count: matched.length, revenue: matched.reduce((s, o) => s + o.total, 0) };
  });

  const monthStarts = eachMonthOfInterval({ start: subMonths(now, 11), end: now });
  const monthly = monthStarts.map(ms => {
    const me = endOfMonth(ms);
    const matched = orders.filter(o => {
      const d = new Date(o.date);
      return isWithinInterval(d, { start: ms, end: me });
    });
    return { label: format(ms, "MMM yy"), count: matched.length, revenue: matched.reduce((s, o) => s + o.total, 0) };
  });

  const yearMap: Record<string, { count: number; revenue: number }> = {};
  orders.forEach(o => {
    const y = new Date(o.date).getFullYear().toString();
    if (!yearMap[y]) yearMap[y] = { count: 0, revenue: 0 };
    yearMap[y].count += 1;
    yearMap[y].revenue += o.total;
  });
  const yearly = Object.entries(yearMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([label, d]) => ({ label, ...d }));

  return { weekly, monthly, yearly };
}

export default MyPerformance;
