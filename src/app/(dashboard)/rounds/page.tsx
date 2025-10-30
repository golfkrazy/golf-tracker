'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Calendar, Flag } from 'lucide-react'
import Link from 'next/link'
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

export default function RoundsPage() {
  const [rounds, setRounds] = useLocalStorage<Round[]>('golf-rounds', [])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Rounds</h1>
        <Button asChild>
          <Link href="/rounds/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Round
          </Link>
        </Button>
      </div>

      {rounds.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Flag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No rounds recorded yet</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Start tracking your golf rounds to see your stats and improve your game.
            </p>
            <Button asChild>
              <Link href="/rounds/new">
                <Plus className="mr-2 h-4 w-4" />
                Record Your First Round
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rounds.map((round) => (
            <Card key={round.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{round.course}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(round.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {round.score} <span className="text-muted-foreground">/ {round.par}</span>
                    </div>
                    <div className="text-sm">
                      {round.score - round.par > 0 ? '+' : ''}
                      {round.score - round.par}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium">Fairways</div>
                    <div>
                      {round.fairwaysHit}/{round.fairwaysTotal}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">GIR</div>
                    <div>
                      {round.greensInRegulation}/18
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Putts</div>
                    <div>{round.putts}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
