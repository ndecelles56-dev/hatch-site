import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Users, 
  Star, 
  Award, 
  TrendingUp,
  Search,
  Filter,
  Plus,
  Calendar,
  Target,
  CheckCircle,
  PlayCircle,
  FileText,
  Video,
  Download
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  rating: number;
  students: number;
  price: number;
  thumbnail: string;
  progress?: number;
  completed?: boolean;
  lessons: number;
}

interface Webinar {
  id: string;
  title: string;
  presenter: string;
  date: string;
  time: string;
  duration: string;
  description: string;
  attendees: number;
  maxAttendees: number;
  category: string;
  isLive?: boolean;
  isUpcoming?: boolean;
}

const Education = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Load initial data - Fixed: Removed problematic loadData function
  useEffect(() => {
    try {
      // Mock data for courses
      const mockCourses: Course[] = [
        {
          id: '1',
          title: 'Real Estate Investment Fundamentals',
          description: 'Learn the basics of real estate investing, from market analysis to property evaluation.',
          instructor: 'Sarah Johnson',
          duration: '4 hours',
          level: 'Beginner',
          category: 'Investment',
          rating: 4.8,
          students: 1250,
          price: 199,
          thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
          progress: 65,
          lessons: 12
        },
        {
          id: '2',
          title: 'Advanced Property Valuation Techniques',
          description: 'Master professional property valuation methods used by industry experts.',
          instructor: 'Mike Rodriguez',
          duration: '6 hours',
          level: 'Advanced',
          category: 'Valuation',
          rating: 4.9,
          students: 890,
          price: 299,
          thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
          progress: 0,
          lessons: 18
        },
        {
          id: '3',
          title: 'Real Estate Marketing Mastery',
          description: 'Effective marketing strategies to attract buyers and sellers in today\'s market.',
          instructor: 'Lisa Chen',
          duration: '3.5 hours',
          level: 'Intermediate',
          category: 'Marketing',
          rating: 4.7,
          students: 2100,
          price: 149,
          thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          progress: 100,
          completed: true,
          lessons: 10
        },
        {
          id: '4',
          title: 'Legal Aspects of Real Estate',
          description: 'Understanding contracts, regulations, and legal requirements in real estate.',
          instructor: 'David Wilson',
          duration: '5 hours',
          level: 'Intermediate',
          category: 'Legal',
          rating: 4.6,
          students: 756,
          price: 249,
          thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
          progress: 30,
          lessons: 15
        }
      ];

      const mockWebinars: Webinar[] = [
        {
          id: '1',
          title: 'Market Trends 2024: What Every Agent Should Know',
          presenter: 'Jennifer Martinez',
          date: '2024-01-25',
          time: '2:00 PM EST',
          duration: '1 hour',
          description: 'Comprehensive overview of current market trends and predictions for 2024.',
          attendees: 245,
          maxAttendees: 500,
          category: 'Market Analysis',
          isUpcoming: true
        },
        {
          id: '2',
          title: 'Digital Marketing for Real Estate Professionals',
          presenter: 'Alex Thompson',
          date: '2024-01-30',
          time: '3:00 PM EST',
          duration: '90 minutes',
          description: 'Learn how to leverage social media and digital tools to grow your business.',
          attendees: 189,
          maxAttendees: 300,
          category: 'Marketing',
          isUpcoming: true
        },
        {
          id: '3',
          title: 'First-Time Buyer Programs and Incentives',
          presenter: 'Maria Garcia',
          date: '2024-01-20',
          time: '1:00 PM EST',
          duration: '45 minutes',
          description: 'Overview of available programs to help first-time homebuyers.',
          attendees: 312,
          maxAttendees: 400,
          category: 'Finance',
          isLive: false
        }
      ];

      setCourses(mockCourses);
      setWebinars(mockWebinars);
    } catch (error) {
      console.error('Error loading education data:', error);
      toast.error('Failed to load education content');
    }
  }, []);

  // Memoized filtered data to prevent unnecessary recalculations
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
      const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, searchTerm, categoryFilter, levelFilter]);

  const filteredWebinars = useMemo(() => {
    return webinars.filter(webinar => {
      const matchesSearch = webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           webinar.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           webinar.presenter.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [webinars, searchTerm]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEnrollCourse = (courseId: string) => {
    toast.success('Successfully enrolled in course!');
  };

  const handleJoinWebinar = (webinarId: string) => {
    toast.success('Successfully registered for webinar!');
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        {course.completed && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          </div>
        )}
        {course.progress && course.progress > 0 && !course.completed && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-blue-600">
              {course.progress}% Complete
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>By {course.instructor}</span>
            <Badge className={getLevelColor(course.level)}>
              {course.level}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {course.duration}
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {course.lessons} lessons
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {course.students.toLocaleString()}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{course.rating}</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              ${course.price}
            </div>
          </div>
          
          {course.progress !== undefined && course.progress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>
          )}
          
          <div className="flex gap-2">
            {course.progress === undefined || course.progress === 0 ? (
              <Button 
                className="flex-1" 
                onClick={() => handleEnrollCourse(course.id)}
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Enroll Now
              </Button>
            ) : course.completed ? (
              <Button variant="outline" className="flex-1">
                <Award className="w-4 h-4 mr-2" />
                View Certificate
              </Button>
            ) : (
              <Button className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Continue Learning
              </Button>
            )}
            <Button variant="outline" size="sm">
              <BookOpen className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const WebinarCard = ({ webinar }: { webinar: Webinar }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-2">{webinar.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{webinar.description}</p>
            </div>
            {webinar.isLive && (
              <Badge className="bg-red-600 animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                LIVE
              </Badge>
            )}
            {webinar.isUpcoming && (
              <Badge className="bg-blue-600">
                Upcoming
              </Badge>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            <div>Presenter: {webinar.presenter}</div>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {webinar.date} at {webinar.time}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {webinar.duration}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-500">
              <Users className="w-4 h-4" />
              {webinar.attendees}/{webinar.maxAttendees} registered
            </div>
            <Badge variant="outline">{webinar.category}</Badge>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Registration</span>
              <span>{Math.round((webinar.attendees / webinar.maxAttendees) * 100)}% full</span>
            </div>
            <Progress value={(webinar.attendees / webinar.maxAttendees) * 100} className="h-2" />
          </div>
          
          <Button 
            className="w-full" 
            onClick={() => handleJoinWebinar(webinar.id)}
            disabled={webinar.attendees >= webinar.maxAttendees}
          >
            {webinar.isLive ? (
              <>
                <Video className="w-4 h-4 mr-2" />
                Join Live
              </>
            ) : webinar.isUpcoming ? (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Register
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Recording
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Education & Training</h1>
          <p className="text-gray-600">Expand your knowledge with courses and webinars</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Request Course
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Courses</p>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Video className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Webinars</p>
                <p className="text-2xl font-bold text-gray-900">{webinars.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.filter(c => c.completed).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.filter(c => c.progress && c.progress > 0 && !c.completed).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Learning Resources</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search courses and webinars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              {activeTab === 'courses' && (
                <>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Investment">Investment</SelectItem>
                      <SelectItem value="Valuation">Valuation</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="webinars">Webinars</TabsTrigger>
              <TabsTrigger value="certificates">Certificates</TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
              
              {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No courses found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'No courses match your search criteria' : 'No courses available at the moment'}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="webinars" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredWebinars.map((webinar) => (
                  <WebinarCard key={webinar.id} webinar={webinar} />
                ))}
              </div>
              
              {filteredWebinars.length === 0 && (
                <div className="text-center py-12">
                  <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No webinars found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'No webinars match your search criteria' : 'No webinars scheduled at the moment'}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="certificates" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.filter(c => c.completed).map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Completed on January 15, 2024
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button variant="outline" className="flex-1">
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {courses.filter(c => c.completed).length === 0 && (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No certificates yet</h3>
                  <p className="text-gray-600">
                    Complete courses to earn certificates
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Course Request Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request New Course</DialogTitle>
            <DialogDescription>
              Let us know what topics you'd like to learn about.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courseTitle">Course Topic *</Label>
              <Input id="courseTitle" placeholder="e.g., Commercial Real Estate Analysis" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="valuation">Valuation</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level">Preferred Level</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe what you'd like to learn..."
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Course request submitted!');
              setShowAddDialog(false);
            }}>
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Education;