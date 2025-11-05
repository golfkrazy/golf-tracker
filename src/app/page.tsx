'use client'

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
        {/* Animated Golf Ball */}
        <div className="relative h-20 mb-8 overflow-hidden">
          <div className="golf-ball-container">
            <div className="golf-ball">
              <div className="golf-ball-inner">⛳</div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute left-0 top-24 text-8xl opacity-10 hidden lg:block">⛳</div>
        <div className="absolute right-0 top-24 text-8xl opacity-10 hidden lg:block">📋</div>
        
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
      
      <style jsx>{`
        .golf-ball-container {
          position: relative;
          width: 100%;
          height: 80px;
        }
        
        .golf-ball {
          position: absolute;
          width: 60px;
          height: 60px;
          background: radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0);
          border-radius: 50%;
          box-shadow: 
            inset -5px -5px 10px rgba(0, 0, 0, 0.2),
            3px 3px 8px rgba(0, 0, 0, 0.3),
            0 0 0 2px rgba(255, 255, 255, 0.1);
          animation: roll 8s ease-in-out infinite;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .golf-ball-inner {
          font-size: 24px;
          animation: counter-roll 8s ease-in-out infinite;
        }
        
        .golf-ball::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: 
            radial-gradient(circle at 20% 25%, transparent 2px, transparent 3px) 0 0 / 8px 8px,
            radial-gradient(circle at 60% 25%, transparent 2px, transparent 3px) 0 0 / 8px 8px,
            radial-gradient(circle at 40% 50%, transparent 2px, transparent 3px) 0 0 / 8px 8px,
            radial-gradient(circle at 20% 75%, transparent 2px, transparent 3px) 0 0 / 8px 8px,
            radial-gradient(circle at 60% 75%, transparent 2px, transparent 3px) 0 0 / 8px 8px;
        }
        
        @keyframes roll {
          0%, 100% {
            left: 0;
            transform: rotate(0deg);
          }
          25% {
            left: calc(50% - 30px);
            transform: rotate(360deg);
          }
          50% {
            left: calc(100% - 60px);
            transform: rotate(720deg);
          }
          75% {
            left: calc(50% - 30px);
            transform: rotate(1080deg);
          }
        }
        
        @keyframes counter-roll {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-360deg);
          }
          50% {
            transform: rotate(-720deg);
          }
          75% {
            transform: rotate(-1080deg);
          }
        }
        
        /* Add a subtle shadow that moves with the ball */
        .golf-ball::after {
          content: '';
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 8px;
          background: radial-gradient(ellipse, rgba(0, 0, 0, 0.3), transparent);
          border-radius: 50%;
          animation: shadow-move 8s ease-in-out infinite;
        }
        
        @keyframes shadow-move {
          0%, 100% {
            opacity: 0.3;
            width: 40px;
          }
          50% {
            opacity: 0.5;
            width: 50px;
          }
        }
      `}</style>
    </div>
  )
}
