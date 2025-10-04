import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, Phone, Mail, ExternalLink } from 'lucide-react'
import { useCustomerExperience } from '@/contexts/CustomerExperienceContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const formatDateTime = (iso?: string | null) => {
  if (!iso) return 'Soonest available'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(iso))
}

const CustomerInquiries: React.FC = () => {
  const navigate = useNavigate()
  const { leadRequests } = useCustomerExperience()

  if (leadRequests.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <Calendar className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">No tour requests yet</h1>
          <p className="mt-2 text-slate-600">
            Schedule a tour or message an agent from any property page and your conversations will appear here.
          </p>
          <Button className="mt-6" onClick={() => navigate('/customer/search')}>
            Explore listings
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My inquiries</h1>
          <p className="text-slate-600">Keep track of tour requests and messages sent to listing agents.</p>
        </div>

        {leadRequests.map((request) => (
          <Card key={request.id} className="border border-slate-200">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="text-xl text-slate-900">{request.propertyAddress}</CardTitle>
                <CardDescription>
                  <span className="font-medium text-slate-700">{request.contactName}</span> • {request.contactEmail}
                </CardDescription>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                    {request.propertyPrice ? request.propertyPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }) : 'Price upon request'}
                  </span>
                  {request.preferredDate && (
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-500" />
                      {formatDateTime(`${request.preferredDate}T${request.preferredTime || '09:00'}`)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={request.channel === 'schedule' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}>
                  {request.channel === 'schedule' ? 'Tour request' : 'Message'}
                </Badge>
                <Badge variant="secondary" className="bg-white text-slate-600">
                  {formatDateTime(request.createdAt)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {request.message && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                  “{request.message}”
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    const route = `/customer/property/${request.propertyId}`
                    toast.info('Opening listing details')
                    navigate(route)
                  }}
                >
                  <ExternalLink className="h-4 w-4" /> View listing
                </Button>
                {request.contactPhone && (
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => toast.success(`Dialing ${request.contactPhone}`)}
                  >
                    <Phone className="h-4 w-4" /> {request.contactPhone}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => toast.success('We will follow up shortly!')}
                >
                  <Mail className="h-4 w-4" /> Send update
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default CustomerInquiries
