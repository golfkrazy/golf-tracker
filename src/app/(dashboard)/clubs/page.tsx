'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target } from 'lucide-react'

export default function ClubsPage() {
  const clubs = [
    { name: 'Driver', distance: 250 },
    { name: '3 Wood', distance: 230 },
    { name: '5 Wood', distance: 210 },
    { name: '3 Hybrid', distance: 200 },
    { name: '4 Iron', distance: 185 },
    { name: '5 Iron', distance: 175 },
    { name: '6 Iron', distance: 165 },
    { name: '7 Iron', distance: 155 },
    { name: '8 Iron', distance: 145 },
    { name: '9 Iron', distance: 135 },
    { name: 'PW', distance: 120 },
    { name: 'SW', distance: 100 },
    { name: 'LW', distance: 80 },
  ]

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Target className="h-8 w-8 mr-3 text-emerald-600" />
        <h1 className="text-3xl font-bold">Club Distances</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            Track your average distances with each club. This feature will be enhanced in future updates to allow you to log and track your actual distances.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clubs.map((club) => (
          <Card key={club.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{club.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-emerald-600">{club.distance}</span>
                <span className="ml-2 text-muted-foreground">yards</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
