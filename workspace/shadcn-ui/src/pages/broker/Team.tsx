import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBroker } from '@/contexts/BrokerContext'
import {
  Users,
  Phone,
  Mail,
  Plus,
  Filter,
  UserPlus,
  Star,
  BarChart3
} from 'lucide-react'

export default function Team() {
  const brokerContext = useBroker()
  
  // Safe access to agents with fallback to empty array
  const agents = brokerContext?.agents || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Mock team data since agents might not be available in simplified context
  const mockTeamMembers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@realty.com',
      phone: '(305) 555-0123',
      role: 'Senior Agent',
      status: 'active',
      experience: '5 years',
      rating: 4.9,
      totalSales: 42
    },
    {
      id: '2',
      name: 'Mike Rodriguez',
      email: 'mike@realty.com',
      phone: '(305) 555-0124',
      role: 'Agent',
      status: 'active',
      experience: '3 years',
      rating: 4.7,
      totalSales: 28
    },
    {
      id: '3',
      name: 'Emily Chen',
      email: 'emily@realty.com',
      phone: '(305) 555-0125',
      role: 'Junior Agent',
      status: 'active',
      experience: '1 year',
      rating: 4.5,
      totalSales: 15
    }
  ]

  // Use agents from context if available, otherwise use mock data
  const teamMembers = agents.length > 0 ? agents : mockTeamMembers

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-600">Manage your team members and track performance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </div>
      </div>

      {/* Team grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((agent) => (
          <Card key={agent.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{agent.name}</CardTitle>
                <Badge className={getStatusColor(agent.status)}>
                  {agent.status}
                </Badge>
              </div>
              <CardDescription>
                {agent.role} • {agent.experience || 'Experience not specified'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {agent.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {agent.phone}
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    <span>{agent.rating || 'N/A'}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {agent.totalSales || 0} sales
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Performance
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Mail className="w-4 h-4 mr-1" />
                    Contact
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state - only show if no mock data and no real agents */}
      {teamMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members yet</h3>
          <p className="text-gray-600 mb-6">Start building your team to grow your business</p>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Your First Team Member
          </Button>
        </div>
      )}
    </div>
  )
}