// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomPieChart, PieChartData } from '@/components/ui/custom-pie-chart';
import { Users, Play, RotateCcw, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';

const usersPieData: PieChartData[] = [
  { name: 'Free', value: 0, color: '#F7F7F7' },
  { name: 'Paid', value: 0, color: '#393E46' },
];

const coursesPieData: PieChartData[] = [
  { name: 'Text', value: 0, color: '#393E46' },
  { name: 'Video', value: 0, color: '#F7F7F7' },
];

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({});

  useEffect(() => {
    async function dashboardData() {
      const postURL = '/api/dashboard';
      const response = await api.post(postURL);
      sessionStorage.setItem('terms', response.data.admin.terms)
      sessionStorage.setItem('privacy', response.data.admin.privacy)
      sessionStorage.setItem('cancel', response.data.admin.cancel)
      sessionStorage.setItem('refund', response.data.admin.refund)
      sessionStorage.setItem('billing', response.data.admin.billing)
      usersPieData[0].value = response.data.paid;
      usersPieData[1].value = response.data.free;
      coursesPieData[0].value = response.data.courses - response.data.videoType;
      coursesPieData[1].value = response.data.videoType;
      setData(response.data);
      setIsLoading(false);
    }
    dashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
      </div>

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
                <span className="text-3xl font-bold">{data.users}</span>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Courses</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Play className="h-8 w-8" />
                <span className="text-3xl font-bold">{data.courses}</span>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recurring Revenue</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <RotateCcw className="h-8 w-8" />
                <span className="text-3xl font-bold">${data.sum}</span>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <DollarSign className="h-8 w-8" />
                <span className="text-3xl font-bold">${data.total}</span>
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
                <CustomPieChart
                  data={usersPieData}
                  innerRadius={60}
                  outerRadius={100}
                  centerLabel="Total"
                  centerValue={usersPieData[0].value + usersPieData[1].value}
                />
                <div className="flex justify-center mt-4 space-x-6">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-gray-700 mr-2" />
                    <span>Paid - {usersPieData[1].value}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-gray-100 border border-border mr-2" />
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
                <CustomPieChart
                  data={coursesPieData}
                  innerRadius={60}
                  outerRadius={100}
                  centerLabel="Total"
                  centerValue={coursesPieData[0].value + coursesPieData[1].value}
                />
                <div className="flex justify-center mt-4 space-x-6">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-gray-700 mr-2" />
                    <span>Text - {coursesPieData[0].value}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-gray-100 border border-border mr-2" />
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
