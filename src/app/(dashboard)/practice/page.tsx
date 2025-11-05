'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Clock, Download, Filter, X, Trash2, ArrowUpDown } from 'lucide-react'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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

  // PDF export filter states
  const [showExportFilter, setShowExportFilter] = useState(false)
  const [exportStartDate, setExportStartDate] = useState('')
  const [exportEndDate, setExportEndDate] = useState('')
  const [exportSortBy, setExportSortBy] = useState<'date' | 'type' | 'duration'>('date')
  const [displaySortBy, setDisplaySortBy] = useState<'date' | 'type' | 'duration'>('date')

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

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this practice session?')) {
      setSessions(sessions.filter(session => session.id !== sessionId))
    }
  }

  const getFilteredSessions = () => {
    let filtered = sessions

    if (exportStartDate || exportEndDate) {
      filtered = sessions.filter(session => {
        const sessionDate = new Date(session.date)
        const startDate = exportStartDate ? new Date(exportStartDate) : null
        const endDate = exportEndDate ? new Date(exportEndDate) : null

        if (startDate && sessionDate < startDate) return false
        if (endDate && sessionDate > endDate) return false
        return true
      })
    }

    return filtered
  }

  const getSortedSessions = (sessionsToSort: PracticeSession[], sortBy: 'date' | 'type' | 'duration') => {
    return [...sessionsToSort].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else if (sortBy === 'type') {
        return a.type.localeCompare(b.type)
      } else {
        return b.duration - a.duration
      }
    })
  }

  const exportToPDF = () => {
    const filteredSessions = getFilteredSessions()
    const sortedSessions = getSortedSessions(filteredSessions, exportSortBy)

    if (sortedSessions.length === 0) {
      alert('No practice sessions to export for the selected date range.')
      return
    }

    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text('Practice Sessions Report', 14, 20)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)

    if (exportStartDate || exportEndDate) {
      const dateRange = `Date Range: ${exportStartDate || 'Start'} to ${exportEndDate || 'End'}`
      doc.text(dateRange, 14, 34)
    }
    doc.text(`Sorted by: ${exportSortBy.charAt(0).toUpperCase() + exportSortBy.slice(1)}`, 14, exportStartDate || exportEndDate ? 40 : 34)

    // Calculate statistics
    const totalSessions = sortedSessions.length
    const totalMinutes = sortedSessions.reduce((sum, s) => sum + s.duration, 0)
    const totalHours = Math.floor(totalMinutes / 60)
    const remainingMinutes = totalMinutes % 60

    const typeBreakdown: Record<string, number> = {}
    sortedSessions.forEach(session => {
      typeBreakdown[session.type] = (typeBreakdown[session.type] || 0) + 1
    })

    let yPosition = exportStartDate || exportEndDate ? 48 : 42

    // Summary statistics
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary', 14, yPosition)
    yPosition += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Total Sessions: ${totalSessions}`, 14, yPosition)
    yPosition += 5
    doc.text(`Total Practice Time: ${totalHours}h ${remainingMinutes}m`, 14, yPosition)
    yPosition += 5
    doc.text(`Average Session: ${Math.round(totalMinutes / totalSessions)} minutes`, 14, yPosition)
    yPosition += 10

    // Practice type breakdown
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Practice Type Breakdown', 14, yPosition)
    yPosition += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    Object.entries(typeBreakdown).forEach(([type, count]) => {
      const percentage = ((count / totalSessions) * 100).toFixed(1)
      doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)}: ${count} sessions (${percentage}%)`, 14, yPosition)
      yPosition += 5
    })
    yPosition += 5

    // Detailed sessions table
    const tableData = sortedSessions.map(session => [
      new Date(session.date).toLocaleDateString(),
      session.type.charAt(0).toUpperCase() + session.type.slice(1),
      `${session.duration} min`,
      session.notes || '-'
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Type', 'Duration', 'Notes']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9 },
      columnStyles: {
        3: { cellWidth: 60 }
      }
    })

    const filename = `practice-sessions-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)
    setShowExportFilter(false)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Practice Sessions</h1>
        <Button
          onClick={() => setShowExportFilter(!showExportFilter)}
          variant="outline"
          disabled={sessions.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export to PDF
        </Button>
      </div>

      {showExportFilter && (
        <Card className="mb-6 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Export Filters
              </span>
              <Button variant="ghost" size="sm" onClick={() => setShowExportFilter(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="exportStartDate">Start Date (Optional)</Label>
                <Input
                  id="exportStartDate"
                  type="date"
                  value={exportStartDate}
                  onChange={(e) => setExportStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="exportEndDate">End Date (Optional)</Label>
                <Input
                  id="exportEndDate"
                  type="date"
                  value={exportEndDate}
                  onChange={(e) => setExportEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="exportSortBy">Sort By</Label>
                <select
                  id="exportSortBy"
                  value={exportSortBy}
                  onChange={(e) => setExportSortBy(e.target.value as 'date' | 'type' | 'duration')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                >
                  <option value="date">Date (Most Recent)</option>
                  <option value="type">Practice Type</option>
                  <option value="duration">Duration (Longest)</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={exportToPDF} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Recent Sessions</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDisplaySortBy(displaySortBy === 'date' ? 'type' : displaySortBy === 'type' ? 'duration' : 'date')}
            >
              <ArrowUpDown className="h-3 w-3 mr-1" />
              {displaySortBy === 'date' ? 'Date' : displaySortBy === 'type' ? 'Type' : 'Duration'}
            </Button>
          </div>
          {sessions.length === 0 ? (
            <Card><CardContent className="flex flex-col items-center justify-center py-12"><p className="text-muted-foreground text-center">No practice sessions yet.</p></CardContent></Card>
          ) : (
            <div className="space-y-4">
              {getSortedSessions(sessions, displaySortBy).slice(0, 10).map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium capitalize">{session.type}</h3>
                        <p className="text-sm text-muted-foreground">{new Date(session.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />{session.duration} min
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSession(session.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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