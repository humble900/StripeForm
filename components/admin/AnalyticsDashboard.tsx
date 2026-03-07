'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, Users, FileText, DollarSign } from 'lucide-react'

interface AnalyticsDashboardProps {
    stats: any
}

export function AnalyticsDashboard({ stats }: AnalyticsDashboardProps) {
    if (!stats?.charts) {
        return (
            <div className="flex items-center justify-center p-12 text-gray-500">
                No analytics data available for this period.
            </div>
        )
    }

    const { usersOverTime, submissionsOverTime, revenueOverTime } = stats.charts

    // Format data for the combined growth chart
    const combinedGrowthData = usersOverTime.map((item: any) => {
        const subItem = submissionsOverTime.find((s: any) => s.date === item.date)
        return {
            date: item.date,
            users: item.count,
            submissions: subItem ? subItem.count : 0
        }
    })

    // Add any dates from submissions that aren't in users
    submissionsOverTime.forEach((subItem: any) => {
        if (!combinedGrowthData.find((item: any) => item.date === subItem.date)) {
            combinedGrowthData.push({
                date: subItem.date,
                users: 0,
                submissions: subItem.count
            })
        }
    })

    // Sort chronologically
    combinedGrowthData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Sort revenue chronologically
    const sortedRevenue = [...revenueOverTime].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Formatting for Tooltips
    const formatCurrency = (value: number) => `$${value.toFixed(2)}`
    const formatDate = (dateStr: string) => {
        // Basic format handling, could be enhanced based on 'period'
        return dateStr
    }

    return (
        <div className="space-y-6">
            {/* Top Level Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Platform Growth</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            +{stats.statistics.newThisPeriod.users + stats.statistics.newThisPeriod.forms}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            New users & forms this period
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Growth Chart (Users & Submissions) */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            Platform Growth Over Time
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            New user registrations and form submissions
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={combinedGrowthData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={formatDate}
                                        stroke="#6B7280"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#6B7280"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line
                                        type="monotone"
                                        name="Users"
                                        dataKey="users"
                                        stroke="#3B82F6"
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2 }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                    <Line
                                        type="monotone"
                                        name="Submissions"
                                        dataKey="submissions"
                                        stroke="#10B981"
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2 }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue Chart */}
                {sortedRevenue.length > 0 && (
                    <Card className="col-span-1 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-500" />
                                Revenue Over Time
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Completed payments volume
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={sortedRevenue}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#6B7280"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            tickFormatter={value => `$${value}`}
                                            stroke="#6B7280"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            dx={-10}
                                        />
                                        <Tooltip
                                            formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#10B981"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Top Forms Bar Chart */}
                {stats.topForms && stats.topForms.length > 0 && (
                    <Card className="col-span-1 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-purple-500" />
                                Top Performing Forms
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Forms with the highest number of submissions
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={stats.topForms}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                        <XAxis type="number" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis
                                            dataKey="title"
                                            type="category"
                                            width={150}
                                            stroke="#6B7280"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#F3F4F6' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar
                                            dataKey="submissionCount"
                                            name="Submissions"
                                            fill="#8B5CF6"
                                            radius={[0, 4, 4, 0]}
                                            barSize={32}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
