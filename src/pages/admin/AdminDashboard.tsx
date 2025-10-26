// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { Users, Play, RotateCcw, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/apiClient';
import { useLocation } from 'react-router-dom';

const userChartConfig = {
  free: { label: 'Free' },
  paid: { label: 'Paid' },
};

const courseChartConfig = {
  text: { label: 'Text' },
  video: { label: 'Video' },
};

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/admin') {
      return;
    }

    let isMounted = true;

    async function dashboardData() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await api.admin.dashboard();
        const payload = response?.data?.data ?? response?.data ?? {};
        const admin = payload.admin ?? {};

        sessionStorage.setItem('terms', admin.terms ?? '');
        sessionStorage.setItem('privacy', admin.privacy ?? '');
        sessionStorage.setItem('cancel', admin.cancel ?? '');
        sessionStorage.setItem('refund', admin.refund ?? '');
        sessionStorage.setItem('billing', admin.billing ?? '');

        if (isMounted) {
          setMetrics(payload);
        }
      } catch (error) {
        console.error('Failed to load admin dashboard metrics', error);
        const message = error?.response?.data?.message ?? 'Failed to load dashboard metrics';
        if (isMounted) {
          setErrorMessage(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    dashboardData();
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const usersPieData = useMemo(() => ([
    { name: 'Free', value: metrics?.free ?? 0, color: '#94A3B8' },
    { name: 'Paid', value: metrics?.paid ?? 0, color: '#2563EB' },
  ]), [metrics]);

  const coursesPieData = useMemo(() => {
    const totalCourses = metrics?.courses ?? 0;
    const videoCourses = metrics?.videoType ?? 0;
    const textCourses = Math.max(totalCourses - videoCourses, 0);

    return [
      { name: 'Text', value: textCourses, color: '#0F172A' },
      { name: 'Video', value: videoCourses, color: '#38BDF8' },
    ];
  }, [metrics]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
      </div>

      {errorMessage && !isLoading && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-destructive">Dashboard data unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{errorMessage}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          // Loading skeleton for stats cards
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-border/50">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          // Actual cards content
          <>
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Users</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Users className="h-8 w-8" />
                <span className="text-3xl font-bold">{metrics?.users ?? 0}</span>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Courses</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Play className="h-8 w-8" />
                <span className="text-3xl font-bold">{metrics?.courses ?? 0}</span>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recurring Revenue</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <RotateCcw className="h-8 w-8" />
                <span className="text-3xl font-bold">${metrics?.sum ?? 0}</span>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <DollarSign className="h-8 w-8" />
                <span className="text-3xl font-bold">${metrics?.total ?? 0}</span>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          // Loading skeleton for charts
          <>
            {[1, 2].map((i) => (
              <Card key={i} className="border-border/50">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="h-80">
                  <div className="flex items-center justify-center h-full">
                    <div className="relative w-40 h-40">
                      <Skeleton className="w-40 h-40 rounded-full" />
                      <Skeleton className="w-20 h-20 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div className="flex justify-center mt-4 space-x-6">
                    <div className="flex items-center">
                      <Skeleton className="h-3 w-3 mr-2" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="h-3 w-3 mr-2" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Users</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ChartContainer config={userChartConfig}>
                  <PieChart>
                    <Pie
                      data={usersPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={1}
                      dataKey="value"
                      nameKey="name"
                    >
                      {usersPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--border)" />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                    />
                  </PieChart>
                </ChartContainer>
                <div className="flex justify-center mt-4 space-x-6">
                  <div className="flex items-center">
                    <div className="h-3 w-3 mr-2 rounded-sm" style={{ backgroundColor: usersPieData[1].color }} />
                    <span>Paid - {usersPieData[1].value}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 mr-2 rounded-sm" style={{ backgroundColor: usersPieData[0].color }} />
                    <span>Free - {usersPieData[0].value}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Courses</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ChartContainer config={courseChartConfig}>
                  <PieChart>
                    <Pie
                      data={coursesPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={1}
                      dataKey="value"
                      nameKey="name"
                    >
                      {coursesPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--border)" />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                    />
                  </PieChart>
                </ChartContainer>
                <div className="flex justify-center mt-4 space-x-6">
                  <div className="flex items-center">
                    <div className="h-3 w-3 mr-2 rounded-sm" style={{ backgroundColor: coursesPieData[0].color }} />
                    <span>Text - {coursesPieData[0].value}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 mr-2 rounded-sm" style={{ backgroundColor: coursesPieData[1].color }} />
                    <span>Video - {coursesPieData[1].value}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
