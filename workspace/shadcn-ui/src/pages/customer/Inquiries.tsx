import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Phone, Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const mockInquiries = [
  {
    id: 1,
    property: "Modern Downtown Condo",
    agent: "Sarah Johnson",
    status: "active",
    lastMessage: "I'd love to schedule a viewing for this weekend",
    date: "2024-01-15",
    responses: 3
  },
  {
    id: 2,
    property: "Family Home in Coral Gables", 
    agent: "Mike Rodriguez",
    status: "pending",
    lastMessage: "What's the neighborhood like for families?",
    date: "2024-01-14",
    responses: 1
  },
  {
    id: 3,
    property: "Luxury Waterfront Villa",
    agent: "Lisa Chen",
    status: "closed",
    lastMessage: "Thank you for the information",
    date: "2024-01-10",
    responses: 5
  }
]

export default function CustomerInquiries() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'closed': return <AlertCircle className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Inquiries</h1>
          <p className="text-gray-600">Track your conversations with real estate agents</p>
        </div>

        {/* Inquiries List */}
        <div className="space-y-4">
          {mockInquiries.map((inquiry) => (
            <Card key={inquiry.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{inquiry.property}</h3>
                      <Badge className={getStatusColor(inquiry.status)}>
                        {getStatusIcon(inquiry.status)}
                        <span className="ml-1 capitalize">{inquiry.status}</span>
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      Agent: <span className="font-medium">{inquiry.agent}</span>
                    </p>
                    
                    <p className="text-gray-700 mb-3">"{inquiry.lastMessage}"</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {inquiry.responses} messages
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {inquiry.date}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}