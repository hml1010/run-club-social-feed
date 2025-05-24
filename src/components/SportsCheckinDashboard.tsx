
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Trophy, TrendingUp, Users, Calendar, Target, Clock, Activity, Award } from 'lucide-react';

interface CheckinData {
  userName: string;
  date: string;
  time: string;
  message: string;
  timestamp: number;
}

interface UserStats {
  name: string;
  count: number;
  streak: number;
  lastCheckin: string;
}

interface DashboardStats {
  todayCount: number;
  weeklyCount: number;
  monthlyCount: number;
  totalUsers: number;
  averageDaily: number;
  topStreak: number;
}

const SportsCheckinDashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    todayCount: 0,
    weeklyCount: 0,
    monthlyCount: 0,
    totalUsers: 0,
    averageDaily: 0,
    topStreak: 0
  });

  const [weeklyRanking, setWeeklyRanking] = useState<UserStats[]>([]);
  const [monthlyRanking, setMonthlyRanking] = useState<UserStats[]>([]);
  const [recentCheckins, setRecentCheckins] = useState<CheckinData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 模拟数据
  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setDashboardStats({
        todayCount: 8,
        weeklyCount: 45,
        monthlyCount: 180,
        totalUsers: 15,
        averageDaily: 6.2,
        topStreak: 23
      });

      setWeeklyRanking([
        { name: '老张', count: 7, streak: 12, lastCheckin: '2024-01-20 18:30' },
        { name: '王总', count: 6, streak: 8, lastCheckin: '2024-01-20 19:15' },
        { name: '李董', count: 6, streak: 5, lastCheckin: '2024-01-20 17:45' },
        { name: '陈总', count: 5, streak: 3, lastCheckin: '2024-01-20 20:00' },
        { name: '刘总', count: 4, streak: 2, lastCheckin: '2024-01-19 18:20' }
      ]);

      setMonthlyRanking([
        { name: '老张', count: 28, streak: 12, lastCheckin: '2024-01-20 18:30' },
        { name: '王总', count: 25, streak: 8, lastCheckin: '2024-01-20 19:15' },
        { name: '李董', count: 24, streak: 5, lastCheckin: '2024-01-20 17:45' },
        { name: '陈总', count: 22, streak: 3, lastCheckin: '2024-01-20 20:00' },
        { name: '刘总', count: 20, streak: 2, lastCheckin: '2024-01-19 18:20' }
      ]);

      setRecentCheckins([
        { userName: '老张', date: '2024-01-20', time: '18:30', message: '今天网球练习1小时，感觉正手击球越来越稳了！', timestamp: Date.now() },
        { userName: '王总', date: '2024-01-20', time: '19:15', message: '健身房力量训练75分钟，今天突破了新的重量！', timestamp: Date.now() - 3600000 },
        { userName: '李董', date: '2024-01-20', time: '17:45', message: '慢跑5公里打卡，天气不错心情也很棒', timestamp: Date.now() - 7200000 }
      ]);

      // 生成图表数据
      const weekData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
          checkins: Math.floor(Math.random() * 12) + 3,
          target: 10
        };
      });
      
      setChartData(weekData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, icon: Icon, description, color = "default" }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color === 'success' ? 'text-green-600' : color === 'warning' ? 'text-orange-600' : 'text-blue-600'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );

  const RankingList = ({ data, title, showStreak = false }: { data: UserStats[], title: string, showStreak?: boolean }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((user, index) => (
            <div key={user.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">{user.name}</div>
                  {showStreak && (
                    <div className="text-sm text-muted-foreground">
                      连续 {user.streak} 天
                    </div>
                  )}
                </div>
              </div>
              <Badge variant={index < 3 ? "default" : "secondary"}>
                {user.count} 次
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-lg">加载运动数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏃‍♂️ 老胡私董会运动打卡</h1>
          <p className="text-gray-600">坚持运动，健康生活</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="今日打卡"
            value={dashboardStats.todayCount}
            icon={Calendar}
            description="已完成今日目标"
            color="success"
          />
          <StatCard
            title="本周打卡"
            value={dashboardStats.weeklyCount}
            icon={TrendingUp}
            description="本周累计次数"
            color="default"
          />
          <StatCard
            title="活跃用户"
            value={dashboardStats.totalUsers}
            icon={Users}
            description="参与运动的成员"
            color="default"
          />
          <StatCard
            title="最高连击"
            value={`${dashboardStats.topStreak}天`}
            icon={Award}
            description="连续打卡记录"
            color="warning"
          />
        </div>

        {/* 主要内容区域 */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="ranking">排行榜</TabsTrigger>
            <TabsTrigger value="analytics">数据分析</TabsTrigger>
            <TabsTrigger value="recent">最新动态</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 本周打卡趋势 */}
              <Card>
                <CardHeader>
                  <CardTitle>本周打卡趋势</CardTitle>
                  <CardDescription>每日打卡人数变化</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="checkins" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="target" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 目标完成度 */}
              <Card>
                <CardHeader>
                  <CardTitle>本周目标完成度</CardTitle>
                  <CardDescription>群体运动目标达成情况</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>每日参与率</span>
                      <span>53%</span>
                    </div>
                    <Progress value={53} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>周目标完成度</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>活跃度指标</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 快速统计 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Target className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">平均每日</p>
                      <p className="text-2xl font-bold">{dashboardStats.averageDaily}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Clock className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">本月总数</p>
                      <p className="text-2xl font-bold">{dashboardStats.monthlyCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Activity className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">参与率</p>
                      <p className="text-2xl font-bold">87%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ranking" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RankingList data={weeklyRanking} title="本周排行榜" showStreak />
              <RankingList data={monthlyRanking} title="本月排行榜" showStreak />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 运动类型分布 */}
              <Card>
                <CardHeader>
                  <CardTitle>运动类型分布</CardTitle>
                  <CardDescription>本月各类运动的比例</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: '网球', value: 35 },
                          { name: '健身', value: 25 },
                          { name: '跑步', value: 20 },
                          { name: '游泳', value: 12 },
                          { name: '其他', value: 8 }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                        <Cell fill="#8b5cf6" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 时间分布 */}
              <Card>
                <CardHeader>
                  <CardTitle>打卡时间分布</CardTitle>
                  <CardDescription>一天中各时段的打卡情况</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { time: '06:00', count: 2 },
                      { time: '09:00', count: 5 },
                      { time: '12:00', count: 8 },
                      { time: '15:00', count: 3 },
                      { time: '18:00', count: 12 },
                      { time: '21:00', count: 6 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>最新打卡动态</CardTitle>
                <CardDescription>群友们的最新运动分享</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCheckins.map((checkin, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{checkin.userName}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {checkin.date} {checkin.time}
                        </span>
                      </div>
                      <p className="text-gray-700">{checkin.message}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline">查看更多动态</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SportsCheckinDashboard;
