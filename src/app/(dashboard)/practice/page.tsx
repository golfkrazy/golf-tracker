'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Clock } from 'lucide-react'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'

type PracticeType = 'driving' | 'chipping' | 'putting' | 'bunker' | 'irons' | 'wedges' | 'other'

type PracticeSession = {
  id: string
  date: string
  type: PracticeType
  duration: number
  notes: string
}

export default function PracticePage() {
  const [sessions, setSessions] = useLocalStorage<PracticeSession[]>('practice-sessions', [])
  const [formData, setFormData] = useState<Omit<PracticeSession, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    type: 'driving',
    duration: 30,
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newSession: PracticeSession = {
      ...formData,
      id: Date.now().toString()
    }
    setSessions([...sessions, newSession])
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'driving',
      duration: 30,
      notes: ''
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? Number(value) : value
    }))
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Practice Sessions</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Log Practice</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Practice Type</Label>
                <select id="type" name="type" value={formData.type} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                  <option value="driving">Driving Range</option>
                  <option value="chipping">Chipping</option>
                  <option value="putting">Putting</option>
                  <option value="bunker">Bunker Play</option>
                  <option value="irons">Iron Play</option>
                  <option value="wedges">Wedge Play</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input id="duration" name="duration" type="number" min="1" value={formData.duration} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <Button type="submit" className="w-full">Save Session</Button>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-4 md:col-span-2 lg:col-span-2">
          <h2 className="text-2xl font-semibold">Recent Sessions</h2>
          {sessions.length === 0 ? (
            <Card><CardContent className="flex flex-col items-center justify-center py-12"><p className="text-muted-foreground text-center">No practice sessions yet.</p></CardContent></Card>
          ) : (
            <div className="space-y-4">
              {sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10).map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium capitalize">{session.type}</h3>
                        <p className="text-sm text-muted-foreground">{new Date(session.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />{session.duration} min
                      </div>
                    </div>
                    {session.notes && <p className="mt-2 text-sm">{session.notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}