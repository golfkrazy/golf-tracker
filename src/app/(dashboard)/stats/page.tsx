'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TrendingDown, TrendingUp, Activity, Download, Filter, X, BarChart3 } from 'lucide-react'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type Round = {
  id: string
  course: string
  date: string
  score: number
  par: number
  fairwaysHit: number
  fairwaysTotal: number
  greensInRegulation: number
  putts: number
}

export default function StatsPage() {
  const [rounds] = useLocalStorage<Round[]>('golf-rounds', [])
  const [isClient, setIsClient] = useState(false)
  
  // PDF export filter states
  const [showExportFilter, setShowExportFilter] = useState(false)
  const [exportStartDate, setExportStartDate] = useState('')
  const [exportEndDate, setExportEndDate] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('all')

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div>Loading...</div>
  }

  const getFilteredRounds = () => {
    let filtered = rounds
    
    // Filter by date range
    if (exportStartDate || exportEndDate) {
      filtered = filtered.filter(round => {
        const roundDate = new Date(round.date)
        const startDate = exportStartDate ? new Date(exportStartDate) : null
        const endDate = exportEndDate ? new Date(exportEndDate) : null
        
        if (startDate && roundDate < startDate) return false
        if (endDate && roundDate > endDate) return false
        return true
      })
    }
    
    // Filter by course
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(round => round.course === selectedCourse)
    }
    
    return filtered
  }

  const calculateStats = (roundsData: Round[]) => {
    const totalRounds = roundsData.length
    const avgScore = totalRounds > 0 
      ? (roundsData.reduce((sum, r) => sum + r.score, 0) / totalRounds).toFixed(1)
      : '0'
    const avgToPar = totalRounds > 0
      ? (roundsData.reduce((sum, r) => sum + (r.score - r.par), 0) / totalRounds).toFixed(1)
      : '0'
    const fairwayAccuracy = totalRounds > 0
      ? ((roundsData.reduce((sum, r) => sum + r.fairwaysHit, 0) / roundsData.reduce((sum, r) => sum + r.fairwaysTotal, 0)) * 100).toFixed(1)
      : '0'
    const girPercentage = totalRounds > 0
      ? ((roundsData.reduce((sum, r) => sum + r.greensInRegulation, 0) / (totalRounds * 18)) * 100).toFixed(1)
      : '0'
    const avgPutts = totalRounds > 0
      ? (roundsData.reduce((sum, r) => sum + r.putts, 0) / totalRounds).toFixed(1)
      : '0'
    
    return { totalRounds, avgScore, avgToPar, fairwayAccuracy, girPercentage, avgPutts }
  }

  const getUniqueCourses = () => {
    const courses = new Set(rounds.map(r => r.course))
    return Array.from(courses).sort()
  }

  const exportToPDF = () => {
    const filteredRounds = getFilteredRounds()
    
    if (filteredRounds.length === 0) {
      alert('No rounds to export for the selected filters.')
      return
    }

    const doc = new jsPDF()
    const stats = calculateStats(filteredRounds)
    
    doc.setFontSize(20)
    doc.text('Golf Statistics Report', 14, 20)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
    
    if (exportStartDate || exportEndDate) {
      const dateRange = `Date Range: ${exportStartDate || 'Start'} to ${exportEndDate || 'End'}`
      doc.text(dateRange, 14, 34)
    }
    if (selectedCourse !== 'all') {
      doc.text(`Course: ${selectedCourse}`, 14, exportStartDate || exportEndDate ? 40 : 34)
    }

    let yPosition = (exportStartDate || exportEndDate) && selectedCourse !== 'all' ? 48 : 
                    (exportStartDate || exportEndDate) || selectedCourse !== 'all' ? 42 : 36

    // Summary Statistics
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary Statistics', 14, yPosition)
    yPosition += 8
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Total Rounds: ${stats.totalRounds}`, 14, yPosition)
    yPosition += 5
    doc.text(`Average Score: ${stats.avgScore}`, 14, yPosition)
    yPosition += 5
    doc.text(`Average to Par: ${Number(stats.avgToPar) > 0 ? '+' : ''}${stats.avgToPar}`, 14, yPosition)
    yPosition += 5
    doc.text(`Fairway Accuracy: ${stats.fairwayAccuracy}%`, 14, yPosition)
    yPosition += 5
    doc.text(`GIR Percentage: ${stats.girPercentage}%`, 14, yPosition)
    yPosition += 5
    doc.text(`Average Putts: ${stats.avgPutts}`, 14, yPosition)
    yPosition += 10

    // Best and Worst Rounds
    const sortedByScore = [...filteredRounds].sort((a, b) => a.score - b.score)
    const bestRound = sortedByScore[0]
    const worstRound = sortedByScore[sortedByScore.length - 1]
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Performance Highlights', 14, yPosition)
    yPosition += 8
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Best Score: ${bestRound.score} at ${bestRound.course} (${new Date(bestRound.date).toLocaleDateString()})`, 14, yPosition)
    yPosition += 5
    doc.text(`Worst Score: ${worstRound.score} at ${worstRound.course} (${new Date(worstRound.date).toLocaleDateString()})`, 14, yPosition)
    yPosition += 5
    doc.text(`Score Range: ${worstRound.score - bestRound.score} strokes`, 14, yPosition)
    yPosition += 10

    // Course Breakdown
    if (selectedCourse === 'all') {
      const courseStats: Record<string, { count: number, avgScore: number }> = {}
      filteredRounds.forEach(round => {
        if (!courseStats[round.course]) {
          courseStats[round.course] = { count: 0, avgScore: 0 }
        }
        courseStats[round.course].count++
        courseStats[round.course].avgScore += round.score
      })
      
      Object.keys(courseStats).forEach(course => {
        courseStats[course].avgScore = courseStats[course].avgScore / courseStats[course].count
      })

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Course Breakdown', 14, yPosition)
      yPosition += 8
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      Object.entries(courseStats).forEach(([course, data]) => {
        doc.text(`${course}: ${data.count} rounds, Avg: ${data.avgScore.toFixed(1)}`, 14, yPosition)
        yPosition += 5
      })
      yPosition += 5
    }

    // Detailed Rounds Table
    const tableData = filteredRounds
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(round => [
        new Date(round.date).toLocaleDateString(),
        round.course,
        round.score.toString(),
        `${round.score - round.par > 0 ? '+' : ''}${round.score - round.par}`,
        `${round.fairwaysHit}/${round.fairwaysTotal}`,
        round.greensInRegulation.toString(),
        round.putts.toString()
      ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Course', 'Score', 'To Par', 'FWY', 'GIR', 'Putts']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { cellWidth: 15 },
        3: { cellWidth: 18 },
        4: { cellWidth: 20 },
        5: { cellWidth: 15 },
        6: { cellWidth: 15 }
      }
    })

    const filename = `golf-stats-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)
    setShowExportFilter(false)
  }

  const totalRounds = rounds.length
  const { avgScore, avgToPar, fairwayAccuracy, girPercentage, avgPutts } = calculateStats(rounds)

  const stats = [
    {
      title: 'Total Rounds',
      value: totalRounds,
      icon: <Activity className="h-6 w-6 text-emerald-600" />,
    },
    {
      title: 'Average Score',
      value: avgScore,
      icon: <TrendingDown className="h-6 w-6 text-emerald-600" />,
    },
    {
      title: 'Average to Par',
      value: `${Number(avgToPar) > 0 ? '+' : ''}${avgToPar}`,
      icon: <TrendingUp className="h-6 w-6 text-emerald-600" />,
    },
    {
      title: 'Fairway Accuracy',
      value: `${fairwayAccuracy}%`,
      icon: <Activity className="h-6 w-6 text-emerald-600" />,
    },
    {
      title: 'GIR Percentage',
      value: `${girPercentage}%`,
      icon: <Activity className="h-6 w-6 text-emerald-600" />,
    },
    {
      title: 'Average Putts',
      value: avgPutts,
      icon: <Activity className="h-6 w-6 text-emerald-600" />,
    },
  ]

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Statistics</h1>
        <Button 
          onClick={() => setShowExportFilter(!showExportFilter)} 
          variant="outline"
          disabled={rounds.length === 0}
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
                <Label htmlFor="selectedCourse">Course</Label>
                <select
                  id="selectedCourse"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                >
                  <option value="all">All Courses</option>
                  {getUniqueCourses().map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
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

      {totalRounds === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No statistics yet</h3>
            <p className="text-muted-foreground text-center">
              Record some rounds to see your statistics and track your progress.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
