'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingDown, TrendingUp, Activity } from 'lucide-react'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'

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

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div>Loading...</div>
  }

  const totalRounds = rounds.length
  const avgScore = totalRounds > 0 
    ? (rounds.reduce((sum, r) => sum + r.score, 0) / totalRounds).toFixed(1)
    : '0'
  const avgToPar = totalRounds > 0
    ? (rounds.reduce((sum, r) => sum + (r.score - r.par), 0) / totalRounds).toFixed(1)
    : '0'
  const fairwayAccuracy = totalRounds > 0
    ? ((rounds.reduce((sum, r) => sum + r.fairwaysHit, 0) / rounds.reduce((sum, r) => sum + r.fairwaysTotal, 0)) * 100).toFixed(1)
    : '0'
  const girPercentage = totalRounds > 0
    ? ((rounds.reduce((sum, r) => sum + r.greensInRegulation, 0) / (totalRounds * 18)) * 100).toFixed(1)
    : '0'
  const avgPutts = totalRounds > 0
    ? (rounds.reduce((sum, r) => sum + r.putts, 0) / totalRounds).toFixed(1)
    : '0'

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
      <h1 className="text-3xl font-bold mb-6">Statistics</h1>

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
