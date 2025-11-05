'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Target, Plus, Trash2, Download, ArrowUpDown, Calendar, TrendingUp, Filter, X } from 'lucide-react'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type ClubDistanceEntry = {
  id: string
  date: string
  distance: number
}

type ClubData = {
  name: string
  avgDistance: number
  userEntries: ClubDistanceEntry[]
}

type SortOption = 'date' | 'distance'

const defaultClubs: ClubData[] = [
  { name: 'Driver', avgDistance: 250, userEntries: [] },
  { name: '3 Wood', avgDistance: 230, userEntries: [] },
  { name: '5 Wood', avgDistance: 210, userEntries: [] },
  { name: '3 Hybrid', avgDistance: 200, userEntries: [] },
  { name: '4 Iron', avgDistance: 185, userEntries: [] },
  { name: '5 Iron', avgDistance: 175, userEntries: [] },
  { name: '6 Iron', avgDistance: 165, userEntries: [] },
  { name: '7 Iron', avgDistance: 155, userEntries: [] },
  { name: '8 Iron', avgDistance: 145, userEntries: [] },
  { name: '9 Iron', avgDistance: 135, userEntries: [] },
  { name: 'PW', avgDistance: 120, userEntries: [] },
  { name: 'SW', avgDistance: 100, userEntries: [] },
  { name: 'LW', avgDistance: 80, userEntries: [] },
]

export default function ClubsPage() {
  const [clubs, setClubs] = useLocalStorage<ClubData[]>('club-distances', defaultClubs)
  const [selectedClub, setSelectedClub] = useState<string | null>(null)
  const [newDistance, setNewDistance] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [isClient, setIsClient] = useState(false)
  
  // Add custom club states
  const [showAddClub, setShowAddClub] = useState(false)
  const [newClubName, setNewClubName] = useState('')
  const [newClubAvgDistance, setNewClubAvgDistance] = useState('')
  
  // PDF export filter states
  const [showExportFilter, setShowExportFilter] = useState(false)
  const [exportStartDate, setExportStartDate] = useState('')
  const [exportEndDate, setExportEndDate] = useState('')
  const [exportSortBy, setExportSortBy] = useState<'club' | 'date' | 'distance'>('club')

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleAddEntry = (clubName: string) => {
    if (!newDistance || parseFloat(newDistance) <= 0) return

    const updatedClubs = clubs.map(club => {
      if (club.name === clubName) {
        const newEntry: ClubDistanceEntry = {
          id: Date.now().toString(),
          date: newDate,
          distance: parseFloat(newDistance)
        }
        return {
          ...club,
          userEntries: [...club.userEntries, newEntry]
        }
      }
      return club
    })

    setClubs(updatedClubs)
    setNewDistance('')
    setNewDate(new Date().toISOString().split('T')[0])
  }

  const handleDeleteEntry = (clubName: string, entryId: string) => {
    const updatedClubs = clubs.map(club => {
      if (club.name === clubName) {
        return {
          ...club,
          userEntries: club.userEntries.filter(entry => entry.id !== entryId)
        }
      }
      return club
    })
    setClubs(updatedClubs)
  }

  const handleAddClub = () => {
    if (!newClubName.trim() || !newClubAvgDistance || parseFloat(newClubAvgDistance) <= 0) return
    
    // Check if club already exists
    if (clubs.some(club => club.name.toLowerCase() === newClubName.trim().toLowerCase())) {
      alert('A club with this name already exists!')
      return
    }

    const newClub: ClubData = {
      name: newClubName.trim(),
      avgDistance: parseFloat(newClubAvgDistance),
      userEntries: []
    }

    setClubs([...clubs, newClub])
    setNewClubName('')
    setNewClubAvgDistance('')
    setShowAddClub(false)
  }

  const handleDeleteClub = (clubName: string) => {
    if (confirm(`Are you sure you want to delete ${clubName}? This will remove all associated distance entries.`)) {
      setClubs(clubs.filter(club => club.name !== clubName))
    }
  }

  const getSortedEntries = (entries: ClubDistanceEntry[]) => {
    return [...entries].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else {
        return b.distance - a.distance
      }
    })
  }

  const calculateUserAverage = (entries: ClubDistanceEntry[]) => {
    if (entries.length === 0) return null
    const sum = entries.reduce((acc, entry) => acc + entry.distance, 0)
    return Math.round(sum / entries.length)
  }

  const hasAnyData = () => {
    return clubs.some(club => club.userEntries.length > 0)
  }

  const getFilteredEntries = (entries: ClubDistanceEntry[]) => {
    if (!exportStartDate && !exportEndDate) return entries
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.date)
      const startDate = exportStartDate ? new Date(exportStartDate) : null
      const endDate = exportEndDate ? new Date(exportEndDate) : null
      
      if (startDate && entryDate < startDate) return false
      if (endDate && entryDate > endDate) return false
      return true
    })
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(20)
    doc.text('Golf Club Distance Report', 14, 20)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
    
    if (exportStartDate || exportEndDate) {
      const dateRange = `Date Range: ${exportStartDate || 'Start'} to ${exportEndDate || 'End'}`
      doc.text(dateRange, 14, 34)
    }
    doc.text(`Sorted by: ${exportSortBy.charAt(0).toUpperCase() + exportSortBy.slice(1)}`, 14, exportStartDate || exportEndDate ? 40 : 34)

    let yPosition = exportStartDate || exportEndDate ? 48 : 42

    // Prepare data for sorting
    let clubsData = clubs.map(club => ({
      ...club,
      filteredEntries: getFilteredEntries(club.userEntries)
    })).filter(club => club.filteredEntries.length > 0)

    // Sort clubs based on exportSortBy
    if (exportSortBy === 'club') {
      clubsData.sort((a, b) => a.name.localeCompare(b.name))
    } else if (exportSortBy === 'distance') {
      clubsData.sort((a, b) => {
        const avgA = calculateUserAverage(a.filteredEntries) || a.avgDistance
        const avgB = calculateUserAverage(b.filteredEntries) || b.avgDistance
        return avgB - avgA
      })
    } else if (exportSortBy === 'date') {
      clubsData.sort((a, b) => {
        const latestA = a.filteredEntries.length > 0 ? new Date(a.filteredEntries[0].date).getTime() : 0
        const latestB = b.filteredEntries.length > 0 ? new Date(b.filteredEntries[0].date).getTime() : 0
        return latestB - latestA
      })
    }

    clubsData.forEach((club) => {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(club.name, 14, yPosition)
      yPosition += 6

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Average Distance: ${club.avgDistance} yards`, 14, yPosition)
      yPosition += 5

      const userAvg = calculateUserAverage(club.filteredEntries)
      if (userAvg) {
        doc.text(`Your Average: ${userAvg} yards (${club.filteredEntries.length} entries)`, 14, yPosition)
        yPosition += 5
      }

      if (club.filteredEntries.length > 0) {
        const tableData = club.filteredEntries
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map(entry => [
            new Date(entry.date).toLocaleDateString(),
            `${entry.distance} yards`
          ])

        autoTable(doc, {
          startY: yPosition,
          head: [['Date', 'Distance']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129] },
          margin: { left: 14 },
          styles: { fontSize: 9 }
        })

        yPosition = (doc as any).lastAutoTable.finalY + 10
      } else {
        yPosition += 10
      }
    })

    const filename = `golf-club-distances-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)
    setShowExportFilter(false)
  }

  if (!isClient) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Target className="h-8 w-8 mr-3 text-emerald-600" />
          <h1 className="text-3xl font-bold">Club Distances</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddClub(!showAddClub)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Club
          </Button>
          <Button 
            onClick={() => setShowExportFilter(!showExportFilter)} 
            variant="outline"
            disabled={!hasAnyData()}
          >
            <Download className="h-4 w-4 mr-2" />
            Export to PDF
          </Button>
        </div>
      </div>

      {showAddClub && (
        <Card className="mb-6 border-emerald-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Add Custom Club</span>
              <Button variant="ghost" size="sm" onClick={() => setShowAddClub(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="newClubName">Club Name</Label>
                <Input
                  id="newClubName"
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  placeholder="e.g., 2 Hybrid"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="newClubAvgDistance">Average Distance (yards)</Label>
                <Input
                  id="newClubAvgDistance"
                  type="number"
                  min="1"
                  value={newClubAvgDistance}
                  onChange={(e) => setNewClubAvgDistance(e.target.value)}
                  placeholder="190"
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleAddClub} 
                  className="w-full"
                  disabled={!newClubName.trim() || !newClubAvgDistance || parseFloat(newClubAvgDistance) <= 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Club
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                  onChange={(e) => setExportSortBy(e.target.value as 'club' | 'date' | 'distance')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                >
                  <option value="club">Club Name</option>
                  <option value="distance">Distance (High to Low)</option>
                  <option value="date">Most Recent</option>
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

      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            Track your club distances! The "Avg Yards" shows standard distances, while "Your Avg" displays your personal average based on your logged distances.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {clubs.map((club) => {
          const userAvg = calculateUserAverage(club.userEntries)
          const isExpanded = selectedClub === club.name

          return (
            <Card key={club.name} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center justify-between">
                  <span>{club.name}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedClub(isExpanded ? null : club.name)}
                    >
                      <Plus className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
                    </Button>
                    {!defaultClubs.some(dc => dc.name === club.name) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClub(club.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg Yards</p>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-emerald-600">{club.avgDistance}</span>
                      <span className="ml-1 text-sm text-muted-foreground">yds</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Your Avg</p>
                    <div className="flex items-baseline">
                      {userAvg ? (
                        <>
                          <span className="text-2xl font-bold text-blue-600">{userAvg}</span>
                          <span className="ml-1 text-sm text-muted-foreground">yds</span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">No data</span>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t pt-4 space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Add New Distance
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`distance-${club.name}`} className="text-xs">Distance (yards)</Label>
                          <Input
                            id={`distance-${club.name}`}
                            type="number"
                            min="1"
                            value={newDistance}
                            onChange={(e) => setNewDistance(e.target.value)}
                            placeholder="150"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`date-${club.name}`} className="text-xs">Date</Label>
                          <Input
                            id={`date-${club.name}`}
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAddEntry(club.name)}
                        className="w-full mt-3"
                        size="sm"
                        disabled={!newDistance || parseFloat(newDistance) <= 0}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Entry
                      </Button>
                    </div>

                    {club.userEntries.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            History ({club.userEntries.length})
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSortBy(sortBy === 'date' ? 'distance' : 'date')}
                          >
                            <ArrowUpDown className="h-3 w-3 mr-1" />
                            {sortBy === 'date' ? 'Date' : 'Distance'}
                          </Button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {getSortedEntries(club.userEntries).map((entry) => (
                            <div
                              key={entry.id}
                              className="flex items-center justify-between p-2 bg-background border rounded-md hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{entry.distance} yards</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(entry.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEntry(club.name, entry.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
