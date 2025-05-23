
import { useState } from 'react';
import { User, Trophy, Target, TrendingUp, Heart, MessageCircle, Camera, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for the social feed - updated for private board group
const feedData = [
  {
    id: 1,
    user: { name: '老张', avatar: '/placeholder.svg', level: '网球达人' },
    activity: '网球',
    duration: '90分钟',
    calories: 520,
    time: '2小时前',
    location: '国际网球中心',
    images: ['/placeholder.svg'],
    likes: 15,
    comments: 6,
    description: '今天和李总切磋了几局，正手击球感觉越来越好了！🎾 明天继续约战'
  },
  {
    id: 2,
    user: { name: '王总', avatar: '/placeholder.svg', level: '健身专家' },
    activity: '力量训练',
    duration: '75分钟',
    calories: 380,
    time: '4小时前',
    location: '私人健身房',
    images: ['/placeholder.svg'],
    likes: 12,
    comments: 4,
    description: '今日训练计划完成！卧推又突破了新的重量 💪 坚持就是胜利'
  },
  {
    id: 3,
    user: { name: '李董', avatar: '/placeholder.svg', level: '登山爱好者' },
    activity: '登山',
    duration: '150分钟',
    distance: '8.5公里',
    calories: 680,
    time: '1天前',
    location: '香山公园',
    images: ['/placeholder.svg'],
    likes: 25,
    comments: 10,
    description: '周末登香山，山顶风景绝佳！和几位群友一起，边聊商业边锻炼 🏔️'
  }
];

const rankingData = [
  { rank: 1, name: '李董', score: 2850, change: '+2' },
  { rank: 2, name: '老张', score: 2720, change: '+1' },
  { rank: 3, name: '王总', score: 2650, change: '-1' },
  { rank: 4, name: '赵总', score: 2480, change: '0' },
  { rank: 5, name: '刘总', score: 2350, change: '+3' }
];

const Index = () => {
  const [selectedTab, setSelectedTab] = useState('feed');

  const FeedPost = ({ post }: any) => (
    <Card className="mb-6 overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-blue-200">
              <AvatarImage src={post.user.avatar} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {post.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-gray-900">{post.user.name}</div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{post.user.level}</Badge>
                <span>•</span>
                <span>{post.time}</span>
              </div>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            {post.activity}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-700 leading-relaxed">{post.description}</p>
        
        <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          {post.duration && (
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{post.duration}</div>
              <div className="text-xs text-gray-500">时长</div>
            </div>
          )}
          {post.distance && (
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{post.distance}</div>
              <div className="text-xs text-gray-500">距离</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{post.calories}</div>
            <div className="text-xs text-gray-500">卡路里</div>
          </div>
        </div>

        {post.location && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{post.location}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors">
            <Heart className="h-4 w-4" />
            <span>{post.likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const RankingItem = ({ item }: any) => (
    <div className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all duration-200">
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
          item.rank <= 3 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {item.rank}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{item.name}</div>
          <div className="text-sm text-gray-500">{item.score} 积分</div>
        </div>
      </div>
      <Badge variant={item.change.startsWith('+') ? 'default' : item.change.startsWith('-') ? 'destructive' : 'secondary'}>
        {item.change}
      </Badge>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  老胡私董会
                </h1>
                <p className="text-sm text-gray-500">日课运动打卡</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg">
              <Camera className="h-4 w-4 mr-2" />
              运动打卡
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm mb-6">
            <TabsTrigger value="feed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              动态
            </TabsTrigger>
            <TabsTrigger value="ranking" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              排行榜
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              目标
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              我的
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {feedData.map(post => (
                  <FeedPost key={post.id} post={post} />
                ))}
              </div>
              
              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      本周目标
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>运动天数</span>
                          <span>4 / 5 天</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div className="bg-white h-2 rounded-full" style={{ width: '80%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>运动时长</span>
                          <span>280 / 300 分钟</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div className="bg-white h-2 rounded-full" style={{ width: '93%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Trophy className="h-5 w-5 text-blue-500" />
                      本周排行
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {rankingData.slice(0, 3).map(item => (
                        <RankingItem key={item.rank} item={item} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ranking">
            <Card className="bg-white/80 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Trophy className="h-6 w-6 text-blue-500" />
                  私董会运动排行榜
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rankingData.map(item => (
                    <RankingItem key={item.rank} item={item} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    本月目标
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">18</div>
                      <div className="text-sm text-gray-500">/ 20 天运动</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    运动类型
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {['网球', '健身', '慢跑', '登山'].map((sport, index) => (
                      <div key={index} className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-sm text-gray-600">{sport}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="bg-white/80 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <User className="h-6 w-6 text-blue-500" />
                  个人资料
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 ring-4 ring-blue-200">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl">
                      我
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">私董会成员</h3>
                    <p className="text-gray-500">运动爱好者</p>
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 mt-2">
                      连续打卡 12 天
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">2,580</div>
                    <div className="text-sm text-gray-500">总积分</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">85</div>
                    <div className="text-sm text-gray-500">运动天数</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">4</div>
                    <div className="text-sm text-gray-500">运动类型</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
