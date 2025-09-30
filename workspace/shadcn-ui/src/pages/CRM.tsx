import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Calendar, { CalendarEvent } from '@/components/Calendar';
import EventModal from '@/components/EventModal';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar as CalendarIcon,
  Phone,
  Mail,
  MapPin,
  Star,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  User,
  Building,
  Target,
  Clock
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed';
  source: string;
  value: number;
  assignedAgent: string;
  lastContact: string;
  notes: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  performance: {
    closedDeals: number;
    totalValue: number;
    conversionRate: number;
  };
}

const CRM = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Mock data
  const [agents] = useState<Agent[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@realestate.com',
      phone: '(555) 123-4567',
      role: 'Senior Agent',
      performance: { closedDeals: 15, totalValue: 2500000, conversionRate: 0.35 }
    },
    {
      id: '2',
      name: 'Mike Rodriguez',
      email: 'mike@realestate.com',
      phone: '(555) 234-5678',
      role: 'Agent',
      performance: { closedDeals: 12, totalValue: 1800000, conversionRate: 0.28 }
    },
    {
      id: '3',
      name: 'Lisa Chen',
      email: 'lisa@realestate.com',
      phone: '(555) 345-6789',
      role: 'Junior Agent',
      performance: { closedDeals: 8, totalValue: 1200000, conversionRate: 0.22 }
    }
  ]);

  const [leads] = useState<Lead[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john@email.com',
      phone: '(555) 111-2222',
      status: 'qualified',
      source: 'Website',
      value: 450000,
      assignedAgent: '1',
      lastContact: '2024-01-15',
      notes: 'Looking for 3BR home in Miami'
    },
    {
      id: '2',
      name: 'Emily Davis',
      email: 'emily@email.com',
      phone: '(555) 333-4444',
      status: 'proposal',
      source: 'Referral',
      value: 680000,
      assignedAgent: '2',
      lastContact: '2024-01-14',
      notes: 'Interested in waterfront property'
    }
  ]);

  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Property Showing - Ocean View Condo',
      description: 'Show luxury condo to the Johnson family',
      startDate: new Date(2024, 0, 20, 10, 0),
      endDate: new Date(2024, 0, 20, 11, 0),
      color: '#3B82F6',
      assignedAgent: '1',
      status: 'pending',
      priority: 'high',
      eventType: 'showing'
    },
    {
      id: '2',
      title: 'Client Meeting - Investment Portfolio Review',
      description: 'Quarterly review with major investor client',
      startDate: new Date(2024, 0, 22, 14, 0),
      endDate: new Date(2024, 0, 22, 15, 30),
      color: '#10B981',
      assignedAgent: '2',
      status: 'pending',
      priority: 'medium',
      eventType: 'meeting'
    }
  ]);

  const handleEventCreate = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString()
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const handleEventEdit = (eventData: CalendarEvent) => {
    setEvents(prev => prev.map(event => event.id === eventData.id ? eventData : event));
  };

  const handleEventDelete = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'proposal': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CRM Dashboard</h1>
          <p className="text-gray-600">Manage your leads, clients, and schedule</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leads.length}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${leads.reduce((sum, lead) => sum + lead.value, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28%</div>
                  <p className="text-xs text-muted-foreground">+2% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{agents.length}</div>
                  <p className="text-xs text-muted-foreground">All agents active</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leads.slice(0, 5).map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-sm text-gray-600">{lead.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            ${lead.value.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-gray-600">
                            {event.startDate.toLocaleDateString()} at {event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <Calendar
              events={events}
              onEventCreate={handleEventCreate}
              onEventEdit={handleEventEdit}
              onEventDelete={handleEventDelete}
              agents={agents.map(agent => ({ id: agent.id, name: agent.name }))}
            />
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Lead Management</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Leads</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <Card key={lead.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{lead.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {lead.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {lead.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                          <div className="text-sm text-gray-600">
                            <div>${lead.value.toLocaleString()}</div>
                            <div>Last contact: {lead.lastContact}</div>
                          </div>
                        </div>
                      </div>
                      {lead.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{lead.notes}</p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Agent Performance</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Agent
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <p className="text-sm text-gray-600">{agent.role}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{agent.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{agent.phone}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Closed Deals</span>
                        <span className="font-semibold">{agent.performance.closedDeals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Value</span>
                        <span className="font-semibold">${agent.performance.totalValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Conversion Rate</span>
                        <span className="font-semibold">{(agent.performance.conversionRate * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Event Modal */}
        <EventModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
            setSelectedDate(null);
          }}
          onSave={selectedEvent ? handleEventEdit : handleEventCreate}
          onDelete={handleEventDelete}
          event={selectedEvent}
          selectedDate={selectedDate}
          agents={agents.map(agent => ({ id: agent.id, name: agent.name }))}
        />
      </div>
    </div>
  );
};

export default CRM;