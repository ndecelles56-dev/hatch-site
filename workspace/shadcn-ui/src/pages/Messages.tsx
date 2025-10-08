import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMessenger } from '@/contexts/MessengerContext'

export default function Messages() {
  const { open } = useMessenger()
  const navigate = useNavigate()

  useEffect(() => {
    open()
  }, [open])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Messenger docked</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <p>The in-app messenger now lives in a floating panel at the bottom right of the screen.</p>
          <p>Use the “Messages” button to reopen it at any time.</p>
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
