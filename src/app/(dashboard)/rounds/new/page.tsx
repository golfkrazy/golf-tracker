'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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

export default function NewRoundPage() {
  const router = useRouter()
  const [rounds, setRounds] = useLocalStorage<Round[]>('golf-rounds', [])
  const [formData, setFormData] = useState<Omit<Round, 'id'>>({
    course: '',
    date: new Date().toISOString().split('T')[0],
    score: 0,
    par: 72,
    fairwaysHit: 0,
    fairwaysTotal: 14,
    greensInRegulation: 0,
    putts: 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newRound: Round = {
      ...formData,
      id: Date.now().toString(),
    }
    setRounds([...rounds, newRound])
    router.push('/rounds')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'course' || name === 'date' ? value : Number(value)
    }))
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/rounds">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold ml-2">New Round</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Round Details</CardTitle>
            <CardDescription>Enter the details of your round</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course">Course Name</Label>
                <Input
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="score">Score</Label>
                <Input
                  id="score"
                  name="score"
                  type="number"
                  value={formData.score || ''}
                  onChange={handleChange}
                  min="54"
                  max="200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="par">Par</Label>
                <Input
                  id="par"
                  name="par"
                  type="number"
                  value={formData.par || 72}
                  onChange={handleChange}
                  min="54"
                  max="100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fairwaysHit">Fairways Hit</Label>
                <Input
                  id="fairwaysHit"
                  name="fairwaysHit"
                  type="number"
                  value={formData.fairwaysHit || ''}
                  onChange={handleChange}
                  min="0"
                  max={formData.fairwaysTotal}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fairwaysTotal">Total Fairways</Label>
                <Input
                  id="fairwaysTotal"
                  name="fairwaysTotal"
                  type="number"
                  value={formData.fairwaysTotal || 14}
                  onChange={handleChange}
                  min="1"
                  max="18"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="greensInRegulation">Greens in Regulation</Label>
                <Input
                  id="greensInRegulation"
                  name="greensInRegulation"
                  type="number"
                  value={formData.greensInRegulation || ''}
                  onChange={handleChange}
                  min="0"
                  max="18"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="putts">Total Putts</Label>
                <Input
                  id="putts"
                  name="putts"
                  type="number"
                  value={formData.putts || ''}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/rounds">Cancel</Link>
            </Button>
            <Button type="submit">Save Round</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
