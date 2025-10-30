import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flag, LineChart, Target, Calendar } from 'lucide-react'

export default function Home() {
  const features = [
    {
      title: 'Track Rounds',
      description: 'Record your scores, fairways hit, and putts for every hole.',
      icon: <Flag className="h-6 w-6 text-emerald-600" />,
    },
    {
      title: 'Monitor Progress',
      description: 'Visualize your improvement with detailed statistics and trends.',
      icon: <LineChart className="h-6 w-6 text-emerald-600" />,
    },
    {
      title: 'Club Distances',
      description: 'Track your average distances with each club in your bag.',
      icon: <Target className="h-6 w-6 text-emerald-600" />,
    },
    {
      title: 'Practice Log',
      description: 'Keep a log of your practice sessions and track your training.',
      icon: <Calendar className="h-6 w-6 text-emerald-600" />,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-20 text-center relative">
        {/* Decorative elements */}
        <div className="absolute left-0 top-0 text-8xl opacity-10 hidden lg:block">⛳</div>
        <div className="absolute right-0 top-0 text-8xl opacity-10 hidden lg:block">📋</div>
        
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl mb-6">
          Improve Your Golf Game with Data
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Track your rounds, analyze your stats, and lower your handicap with our comprehensive golf tracking platform.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/rounds">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="#features">Learn More</Link>
          </Button>
        </div>
      </section>

      <section id="features" className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  {feature.icon}
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
