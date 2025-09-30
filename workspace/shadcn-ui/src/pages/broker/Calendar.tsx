import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Filter,
  Users,
  MapPin,
  Phone,
  Edit,
  Trash2,
  Mail
} from 'lucide-react'
import { format, isToday, isTomorrow, parseISO, isSameDay, isValid } from 'date-fns'

interface Appointment {
  id: string
  title: string
  time: string
  date: string
  client: string
  type: 'showing' | 'meeting' | 'inspection' | 'closing'
  location: string
  notes?: string
  clientPhone?: string
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [showEditAppointment, setShowEditAppointment] = useState(false)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [showCallDialog, setShowCallDialog] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      title: 'Property Showing - Ocean View Condo',
      time: '10:00',
      date: format(new Date(), 'yyyy-MM-dd'),
      client: 'Jennifer Martinez',
      type: 'showing',
      location: '123 Ocean Drive, Miami Beach',
      notes: 'Client interested in waterfront properties',
      clientPhone: '+1 (305) 555-0123'
    },
    {
      id: '2',
      title: 'Client Meeting - First Time Buyer',
      time: '14:00',
      date: format(new Date(), 'yyyy-MM-dd'),
      client: 'Robert Chen',
      type: 'meeting',
      location: 'Office',
      notes: 'Pre-approval meeting',
      clientPhone: '+1 (305) 555-0124'
    },
    {
      id: '3',
      title: 'Property Inspection',
      time: '09:00',
      date: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      client: 'Lisa Thompson',
      type: 'inspection',
      location: '456 Palm Avenue, Tampa',
      notes: 'Final inspection before closing',
      clientPhone: '+1 (305) 555-0125'
    }
  ])

  const [newAppointment, setNewAppointment] = useState({
    title: '',
    time: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    client: '',
    type: 'meeting' as const,
    location: '',
    notes: '',
    clientPhone: ''
  })

  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: ''
  })

  // Create appointment dates for calendar modifiers
  const appointmentDates = useMemo(() => {
    return appointments
      .map(apt => {
        try {
          const date = parseISO(apt.date)
          return isValid(date) ? date : null
        } catch {
          return null
        }
      })
      .filter((date): date is Date => date !== null)
  }, [appointments])

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'showing': return 'bg-blue-100 text-blue-800'
      case 'meeting': return 'bg-green-100 text-green-800'
      case 'inspection': return 'bg-purple-100 text-purple-800'
      case 'closing': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDateLabel = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      if (!isValid(date)) return dateString
      if (isToday(date)) return 'Today'
      if (isTomorrow(date)) return 'Tomorrow'
      return format(date, 'MMM dd')
    } catch {
      return dateString
    }
  }

  const formatTime = (time: string) => {
    if (time && time.includes(':')) {
      const [hours, minutes] = time.split(':')
      const hour = parseInt(hours)
      if (isNaN(hour)) return time
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      return `${displayHour}:${minutes} ${ampm}`
    }
    return time
  }

  const getSelectedDateAppointments = () => {
    if (!selectedDate) return []
    const selectedDateString = format(selectedDate, 'yyyy-MM-dd')
    return appointments.filter(apt => apt.date === selectedDateString)
  }

  const handleAddAppointment = () => {
    if (!newAppointment.title || !newAppointment.client || !newAppointment.time) {
      alert('Please fill in all required fields')
      return
    }

    const appointment: Appointment = {
      ...newAppointment,
      id: Date.now().toString()
    }

    setAppointments([...appointments, appointment])
    setNewAppointment({
      title: '',
      time: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      client: '',
      type: 'meeting',
      location: '',
      notes: '',
      clientPhone: ''
    })
    setShowNewAppointment(false)
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setNewAppointment({
      title: appointment.title,
      time: appointment.time,
      date: appointment.date,
      client: appointment.client,
      type: appointment.type,
      location: appointment.location,
      notes: appointment.notes || '',
      clientPhone: appointment.clientPhone || ''
    })
    setShowEditAppointment(true)
  }

  const handleUpdateAppointment = () => {
    if (!editingAppointment || !newAppointment.title || !newAppointment.client || !newAppointment.time) {
      alert('Please fill in all required fields')
      return
    }

    const updatedAppointments = appointments.map(apt => 
      apt.id === editingAppointment.id 
        ? { ...newAppointment, id: editingAppointment.id }
        : apt
    )

    setAppointments(updatedAppointments)
    setShowEditAppointment(false)
    setEditingAppointment(null)
    setNewAppointment({
      title: '',
      time: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      client: '',
      type: 'meeting',
      location: '',
      notes: '',
      clientPhone: ''
    })
  }

  const handleDeleteAppointment = (id: string) => {
    setAppointments(appointments.filter(apt => apt.id !== id))
  }

  const handleCallClient = (appointment: Appointment) => {
    if (appointment.clientPhone) {
      // Try to open phone dialer
      window.open(`tel:${appointment.clientPhone}`, '_self')
    } else {
      setEditingAppointment(appointment)
      setShowCallDialog(true)
    }
  }

  const handleReschedule = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setRescheduleData({
      date: appointment.date,
      time: appointment.time
    })
    setShowRescheduleDialog(true)
  }

  const handleRescheduleConfirm = () => {
    if (!editingAppointment || !rescheduleData.date || !rescheduleData.time) {
      alert('Please select both date and time')
      return
    }

    const updatedAppointments = appointments.map(apt => 
      apt.id === editingAppointment.id 
        ? { ...apt, date: rescheduleData.date, time: rescheduleData.time }
        : apt
    )

    setAppointments(updatedAppointments)
    setShowRescheduleDialog(false)
    setEditingAppointment(null)
    setRescheduleData({ date: '', time: '' })
  }

  const upcomingAppointments = appointments
    .filter(apt => {
      try {
        return new Date(apt.date + 'T' + apt.time) >= new Date()
      } catch {
        return false
      }
    })
    .sort((a, b) => {
      try {
        return new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime()
      } catch {
        return 0
      }
    })
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Manage your appointments and schedule</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
                <DialogDescription>
                  Add a new appointment to your calendar
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newAppointment.title}
                    onChange={(e) => setNewAppointment({...newAppointment, title: e.target.value})}
                    placeholder="Property showing, client meeting..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="client">Client *</Label>
                  <Input
                    id="client"
                    value={newAppointment.client}
                    onChange={(e) => setNewAppointment({...newAppointment, client: e.target.value})}
                    placeholder="Client name"
                  />
                </div>

                <div>
                  <Label htmlFor="clientPhone">Client Phone</Label>
                  <Input
                    id="clientPhone"
                    value={newAppointment.clientPhone}
                    onChange={(e) => setNewAppointment({...newAppointment, clientPhone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={newAppointment.type} onValueChange={(value: any) => setNewAppointment({...newAppointment, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="showing">Property Showing</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="closing">Closing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newAppointment.location}
                    onChange={(e) => setNewAppointment({...newAppointment, location: e.target.value})}
                    placeholder="Office, property address..."
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddAppointment} className="flex-1">
                    Schedule Appointment
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewAppointment(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Appointment Dialog */}
      <Dialog open={showEditAppointment} onOpenChange={setShowEditAppointment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>
              Update appointment details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={newAppointment.title}
                onChange={(e) => setNewAppointment({...newAppointment, title: e.target.value})}
                placeholder="Property showing, client meeting..."
              />
            </div>
            
            <div>
              <Label htmlFor="edit-client">Client *</Label>
              <Input
                id="edit-client"
                value={newAppointment.client}
                onChange={(e) => setNewAppointment({...newAppointment, client: e.target.value})}
                placeholder="Client name"
              />
            </div>

            <div>
              <Label htmlFor="edit-clientPhone">Client Phone</Label>
              <Input
                id="edit-clientPhone"
                value={newAppointment.clientPhone}
                onChange={(e) => setNewAppointment({...newAppointment, clientPhone: e.target.value})}
                placeholder="+1 (305) 555-0125"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-time">Time *</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-type">Type</Label>
              <Select value={newAppointment.type} onValueChange={(value: any) => setNewAppointment({...newAppointment, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="showing">Property Showing</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="closing">Closing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={newAppointment.location}
                onChange={(e) => setNewAppointment({...newAppointment, location: e.target.value})}
                placeholder="Office, property address..."
              />
            </div>

            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleUpdateAppointment} className="flex-1">
                Update Appointment
              </Button>
              <Button variant="outline" onClick={() => setShowEditAppointment(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Select new date and time for "{editingAppointment?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reschedule-date">New Date</Label>
                <Input
                  id="reschedule-date"
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="reschedule-time">New Time</Label>
                <Input
                  id="reschedule-time"
                  type="time"
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleRescheduleConfirm} className="flex-1">
                Reschedule
              </Button>
              <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Call Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Client</DialogTitle>
            <DialogDescription>
              No phone number available for {editingAppointment?.client}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              You can add a phone number by editing this appointment, or contact the client through other means.
            </p>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => {
                  setShowCallDialog(false)
                  if (editingAppointment) {
                    handleEditAppointment(editingAppointment)
                  }
                }} 
                className="flex-1"
              >
                Edit Appointment
              </Button>
              <Button variant="outline" onClick={() => setShowCallDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 xl:grid-cols-7 gap-6">
        {/* Calendar - Fixed alignment with custom CSS */}
        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle className="text-xl">Calendar</CardTitle>
            <CardDescription>Select a date to view appointments</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <style jsx>{`
              .calendar-container .rdp-month_grid {
                width: 100%;
                table-layout: fixed;
              }
              .calendar-container .rdp-weekdays {
                display: flex;
                width: 100%;
              }
              .calendar-container .rdp-weekday {
                flex: 1;
                text-align: center;
                width: calc(100% / 7);
                padding: 0.5rem 0;
                font-size: 0.875rem;
                font-weight: 500;
                color: #6b7280;
              }
              .calendar-container .rdp-week {
                display: flex;
                width: 100%;
              }
              .calendar-container .rdp-week td {
                flex: 1;
                width: calc(100% / 7);
                text-align: center;
                padding: 0;
              }
              .calendar-container .rdp-day_button {
                width: 100%;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
            `}</style>
            <div className="calendar-container">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border w-full"
                modifiers={{
                  hasAppointments: appointmentDates
                }}
                modifiersStyles={{
                  hasAppointments: {
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    fontWeight: 'bold'
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Appointments */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-xl">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM do, yyyy') : 'Select a date'}
            </CardTitle>
            <CardDescription>
              {selectedDate ? `Appointments for ${getDateLabel(format(selectedDate, 'yyyy-MM-dd'))}` : 'Choose a date to view appointments'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getSelectedDateAppointments().length > 0 ? (
                getSelectedDateAppointments().map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{formatTime(appointment.time)}</div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{appointment.title}</h3>
                          <Badge className={getTypeColor(appointment.type)}>
                            {appointment.type}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            <span>{appointment.client}</span>
                          </div>
                          {appointment.location && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{appointment.location}</span>
                            </div>
                          )}
                        </div>
                        
                        {appointment.notes && (
                          <p className="text-sm text-gray-500 mt-1">{appointment.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCallClient(appointment)}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditAppointment(appointment)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{appointment.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteAppointment(appointment.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No appointments scheduled for this date</p>
                  <Button 
                    variant="outline" 
                    className="mt-3"
                    onClick={() => {
                      setNewAppointment({
                        ...newAppointment,
                        date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
                      })
                      setShowNewAppointment(true)
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>Your next scheduled meetings and showings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="text-sm font-medium text-gray-900">{getDateLabel(appointment.date)}</div>
                      <div className="text-lg font-bold text-blue-600">{formatTime(appointment.time)}</div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{appointment.title}</h3>
                        <Badge className={getTypeColor(appointment.type)}>
                          {appointment.type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{appointment.client}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{appointment.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCallClient(appointment)}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleReschedule(appointment)}
                    >
                      Reschedule
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming appointments</h3>
                <p className="text-gray-600 mb-6">Start scheduling meetings with your clients</p>
                <Button onClick={() => setShowNewAppointment(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Your First Appointment
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}