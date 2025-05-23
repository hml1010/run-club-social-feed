
import { useState } from 'react';
import { User, Trophy, Target, TrendingUp, Heart, MessageCircle, Camera, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for the social feed
const feedData = [
  {
    id: 1,
    user: { name: '小明', avatar: '/placeholder.svg', level: 'Pro Runner' },
    activity: '晨跑',
    duration: '45分钟',
    distance: '8.5公里',
    calories: 420,
    time: '2小时前',
    location: '世纪公园',
    images: ['/placeholder.svg'],
    likes: 24,
    comments: 8,
    description: '今天的晨跑状态超棒！天气正好，一路上看到很多樱花盛开 🌸'
  },
  {
    id: 2,
    user: { name: '小红', avatar: '/placeholder.svg', level: 'Fitness Enthusiast' },
    activity: '力量训练',
    duration: '60分钟',
    calories: 350,
    time: '5小时前',
    location: '健身房',
    images: ['/placeholder.svg'],
    likes: 18,
    comments: 5,
    description: '今天完成了腿部训练，深蹲 80kg × 5组！💪 明天继续加油'
  },
  {
    id: 3,
    user: { name: '阿强', avatar: '/placeholder.svg', level: 'Cycling Master' },
    activity: '骑行',
    duration: '120分钟',
    distance: '35公里',
    calories: 580,
    time: '1天前',
    location: '滨江绿道',
    images: ['/placeholder.svg'],
    likes: 32,
    comments: 12,
    description: '周末骑行到钱塘江边，风景太美了！🚴‍♂️ 下次约几个朋友一起'
  }
];

const rankingData = [
  { rank: 1, name: '小明', score: 2850, change: '+2' },
  { rank: 2, name: '阿强', score: 2720, change: '+1' },
  { rank: 3, name: '小红', score: 2650, change: '-1' },
  { rank: 4, name: '李华', score: 2480, change: '0' },
  { rank: 5, name: '王芳', score: 2350, change: '+3' }
];

const Index = () => {
  const [selectedTab, setSelectedTab] = useState('feed');

  const FeedPost = ({ post }: any) => (
    <Card className="mb-6 overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-orange-200">
              <AvatarImage src={post.user.avatar} />
              <AvatarFallback className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
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
          <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-0">
            {post.activity}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-700 leading-relaxed">{post.description}</p>
        
        <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
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
    <div className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 rounded-lg transition-all duration-200">
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
          item.rank <= 3 
            ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white' 
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Run Club
                </h1>
                <p className="text-sm text-gray-500">运动社交平台</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white border-0 shadow-lg">
              <Camera className="h-4 w-4 mr-2" />
              打卡
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm mb-6">
            <TabsTrigger value="feed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-red-500 data-[state=active]:text-white">
              动态
            </TabsTrigger>
            <TabsTrigger value="ranking" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-red-500 data-[state=active]:text-white">
              排行榜
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-red-500 data-[state=active]:text-white">
              目标
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-red-500 data-[state=active]:text-white">
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
                <Card className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      今日目标
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>步数</span>
                          <span>8,240 / 10,000</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div className="bg-white h-2 rounded-full" style={{ width: '82%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>运动时长</span>
                          <span>45 / 60 分钟</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div className="bg-white h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Trophy className="h-5 w-5 text-orange-500" />
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
                  <Trophy className="h-6 w-6 text-orange-500" />
                  运动排行榜
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
                    <Calendar className="h-5 w-5 text-orange-500" />
                    本月目标
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">20</div>
                      <div className="text-sm text-gray-500">/ 25 天运动</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    成就徽章
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {['7天连续', '月度冠军', '距离王者'].map((badge, index) => (
                      <div key={index} className="text-center p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-xs text-gray-600">{badge}</div>
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
                  <User className="h-6 w-6 text-orange-500" />
                  个人资料
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 ring-4 ring-orange-200">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xl">
                      我
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">运动达人</h3>
                    <p className="text-gray-500">Pro Runner</p>
                    <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-0 mt-2">
                      连续打卡 15 天
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">2,850</div>
                    <div className="text-sm text-gray-500">总积分</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">127</div>
                    <div className="text-sm text-gray-500">总运动天数</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">315</div>
                    <div className="text-sm text-gray-500">总距离(公里)</div>
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
