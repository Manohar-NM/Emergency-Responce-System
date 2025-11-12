"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Heart, MapPin } from "lucide-react"
import { NotificationCenter } from "@/components/notification-center"

export default function LandingPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/ers-logo.png" alt="ERS Logo" width={40} height={40} className="rounded-lg" />
            <span className="font-semibold text-lg text-foreground">ERS</span>
          </div>
          <div className="flex gap-3 items-center">
            <NotificationCenter />
            <Link href="/auth/login">
              <Button variant="outline" className="transition-smooth bg-transparent">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-primary hover:bg-primary/90 transition-smooth">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-6">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground leading-tight">
            Emergency Response,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Instantly Connected
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Connect with nearby hospitals in seconds. One tap. One button. Your life matters.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/auth/register?role=victim">
              <Button size="lg" className="bg-primary hover:bg-primary/90 transition-smooth">
                I'm a Victim
              </Button>
            </Link>
            <Link href="/auth/register?role=hospital">
              <Button size="lg" variant="outline" className="transition-smooth bg-transparent">
                I'm a Hospital
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              id: "sos",
              icon: AlertCircle,
              title: "Instant SOS",
              description: "One-tap emergency alert sent to nearby hospitals with your location",
              color: "from-accent to-accent/50",
            },
            {
              id: "location",
              icon: MapPin,
              title: "Real-time Location",
              description: "Continuous GPS tracking ensures hospitals find you quickly",
              color: "from-secondary to-secondary/50",
            },
            {
              id: "medical",
              icon: Heart,
              title: "Medical Profile",
              description: "Share blood type, allergies, and medical history instantly",
              color: "from-primary to-primary/50",
            },
          ].map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.id}
                className="border-border/50 transition-smooth hover:border-primary/50 hover:shadow-lg cursor-pointer"
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">How It Works</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-primary">For Victims</h3>
            {[
              { step: "1", title: "Register", desc: "Create account with medical info" },
              { step: "2", title: "Press SOS", desc: "One tap when emergency strikes" },
              { step: "3", title: "Get Help", desc: "Nearest hospitals respond instantly" },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-secondary">For Hospitals</h3>
            {[
              { step: "1", title: "Register", desc: "Add hospital details and services" },
              { step: "2", title: "Receive Alerts", desc: "Real-time SOS notifications" },
              { step: "3", title: "Respond", desc: "Accept and dispatch ambulance" },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="pt-12 text-center">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Save Lives?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of users and hospitals connected through ERS
            </p>
            <Link href="/auth/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 transition-smooth">
                Start Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-muted-foreground">
          <p>ERS - Emergency Response System © 2025. Saving lives, one connection at a time.</p>
        </div>
      </footer>
    </div>
  )
}
