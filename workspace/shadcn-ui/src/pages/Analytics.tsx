import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Home,
  Calendar,
  MapPin,
  Download,
  RefreshCw,
  Target,
  PieChart,
  LineChart,
  Calculator
} from 'lucide-react';

const Analytics = () => {
  // Mock market data
  const marketData = {
    medianPrice: 425000,
    priceChange: 8.5,
    inventory: 2.3,
    daysOnMarket: 28,
    salesVolume: 1250,
    volumeChange: 12.3
  };

  const topMarkets = [
    { city: 'Miami-Dade', medianPrice: 580000, change: 12.5, volume: 450 },
    { city: 'Broward', medianPrice: 485000, change: 9.8, volume: 320 },
    { city: 'Palm Beach', medianPrice: 525000, change: 7.2, volume: 280 },
    { city: 'Orange (Orlando)', medianPrice: 385000, change: 15.1, volume: 380 },
    { city: 'Hillsborough (Tampa)', medianPrice: 395000, change: 11.4, volume: 340 }
  ];

  const investmentMetrics = [
    { metric: 'Cap Rate', value: '6.8%', change: '+0.3%', trend: 'up' },
    { metric: 'Cash Flow', value: '$1,250', change: '+$180', trend: 'up' },
    { metric: 'ROI', value: '18.5%', change: '+2.1%', trend: 'up' },
    { metric: 'Vacancy Rate', value: '4.2%', change: '-0.8%', trend: 'down' }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Market Analytics</h1>
          <p className="text-muted-foreground">
            Real-time Florida real estate market data and investment insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Market Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Median Home Price</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(marketData.medianPrice)}</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-green-600">+{marketData.priceChange}%</span>
              <span className="text-muted-foreground ml-1">vs last year</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory (Months)</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketData.inventory}</div>
            <div className="flex items-center text-xs">
              <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              <span className="text-red-600">Seller's Market</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days on Market</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketData.daysOnMarket}</div>
            <div className="flex items-center text-xs">
              <TrendingDown className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-green-600">-3 days</span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketData.salesVolume.toLocaleString()}</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-green-600">+{marketData.volumeChange}%</span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="market" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="market">Market Trends</TabsTrigger>
          <TabsTrigger value="investment">Investment Analysis</TabsTrigger>
          <TabsTrigger value="foreclosure">Foreclosure Data</TabsTrigger>
          <TabsTrigger value="tax">Tax Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="space-y-6">
          {/* Top Markets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Top Florida Markets
              </CardTitle>
              <CardDescription>
                Performance metrics by county/metropolitan area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topMarkets.map((market, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{market.city}</p>
                        <p className="text-sm text-muted-foreground">
                          {market.volume} sales this month
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(market.medianPrice)}</p>
                      <div className="flex items-center text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                        <span className="text-green-600">+{market.change}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Visualization Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Trends (12 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Price trend chart would display here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Volume by Property Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Property type distribution chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="investment" className="space-y-6">
          {/* Investment Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {investmentMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center text-xs">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                    )}
                    <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {metric.change}
                    </span>
                    <span className="text-muted-foreground ml-1">vs last quarter</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Investment Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle>Top Investment Opportunities</CardTitle>
              <CardDescription>
                Properties with highest potential ROI based on market analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">1234 Oak Street, Tampa</p>
                    <p className="text-sm text-muted-foreground">Single Family • $285,000</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-green-50 text-green-700 mb-1">
                      22% ROI
                    </Badge>
                    <p className="text-sm text-muted-foreground">Est. $1,850/mo rent</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">567 Pine Avenue, Orlando</p>
                    <p className="text-sm text-muted-foreground">Duplex • $195,000</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-green-50 text-green-700 mb-1">
                      19% ROI
                    </Badge>
                    <p className="text-sm text-muted-foreground">Est. $2,400/mo rent</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">890 Beach Road, Fort Lauderdale</p>
                    <p className="text-sm text-muted-foreground">Condo • $165,000</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-green-50 text-green-700 mb-1">
                      17% ROI
                    </Badge>
                    <p className="text-sm text-muted-foreground">Est. $1,650/mo rent</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="foreclosure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Foreclosure Market Analysis</CardTitle>
              <CardDescription>
                Current foreclosure trends and opportunities in Florida
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-orange-600 mb-2">1,247</div>
                  <p className="text-sm text-muted-foreground">Pre-foreclosures</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-red-600 mb-2">892</div>
                  <p className="text-sm text-muted-foreground">Auction Properties</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">634</div>
                  <p className="text-sm text-muted-foreground">REO Properties</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Assessment Data</CardTitle>
              <CardDescription>
                Property tax information and assessment trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Average Millage Rate</h3>
                    <div className="text-2xl font-bold">18.5</div>
                    <p className="text-sm text-muted-foreground">Mills (per $1,000 assessed value)</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Homestead Exemption</h3>
                    <div className="text-2xl font-bold">$50,000</div>
                    <p className="text-sm text-muted-foreground">Standard exemption amount</p>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Save Our Homes Cap</h3>
                  <p className="text-sm text-blue-700">
                    Assessment increases limited to 3% annually or CPI, whichever is lower
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Calculator */}
          <Card>
            <CardHeader>
              <CardTitle>Property Tax Calculator</CardTitle>
              <CardDescription>
                Estimate annual property taxes with exemptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-6 text-center">
                <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Interactive tax calculator would be displayed here</p>
                <p className="text-sm text-muted-foreground">Input property value and get tax estimates</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;