'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { UserPlus, Users, Building, Shield, Settings } from 'lucide-react'
import { BrokerSetupModal } from '../../components/admin/BrokerSetupModal'
import { RoleService } from '../../services/roleService'
import { BrokerProfile } from '../../types/user'

export const AdminPanel: React.FC = () => {
  const [brokerSetupOpen, setBrokerSetupOpen] = useState(false)
  const [brokers, setBrokers] = useState<BrokerProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBrokers()
  }, [])

  const loadBrokers = async () => {
    try {
      const result = await RoleService.getAllBrokers()
      if (result.success && result.brokers) {
        setBrokers(result.brokers)
      }
    } catch (error) {
      console.error('Error loading brokers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBrokerSetupSuccess = () => {
    loadBrokers() // Refresh the broker list
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage users, roles, and platform settings</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Admin Access
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setBrokerSetupOpen(true)}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Grant Broker Access
            </CardTitle>
            <CardDescription>
              Upgrade user to broker privileges
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              User Management
            </CardTitle>
            <CardDescription>
              View and manage all users
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="w-5 h-5 text-purple-600" />
              Firm Management
            </CardTitle>
            <CardDescription>
              Manage real estate firms
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              Platform Settings
            </CardTitle>
            <CardDescription>
              Configure system settings
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Current Brokers */}
      <Card>
        <CardHeader>
          <CardTitle>Current Brokers</CardTitle>
          <CardDescription>
            Users with broker privileges on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading brokers...</div>
          ) : brokers.length === 0 ? (
            <Alert>
              <AlertDescription>
                No brokers found. Use the "Grant Broker Access" button to create the first broker.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {brokers.map((broker) => (
                <div key={broker.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{broker.first_name} {broker.last_name}</h4>
                    <p className="text-sm text-muted-foreground">{broker.email}</p>
                    <p className="text-sm text-muted-foreground">License: {broker.license_number}</p>
                    {broker.firm && (
                      <p className="text-sm text-muted-foreground">Firm: {broker.firm.name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">Broker</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created: {new Date(broker.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Broker Setup Modal */}
      <BrokerSetupModal
        isOpen={brokerSetupOpen}
        onClose={() => setBrokerSetupOpen(false)}
        onSuccess={handleBrokerSetupSuccess}
      />
    </div>
  )
}