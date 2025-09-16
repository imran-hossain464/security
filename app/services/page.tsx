import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Calendar, MessageCircle, Users, MapPin, Bell, Shield, Zap, Clock } from "lucide-react"
import Link from "next/link"

const services = [
  {
    icon: Heart,
    title: "Help Network",
    description: "Connect neighbors who need help with those who can provide it",
    features: [
      "Request assistance for daily tasks",
      "Offer your skills to help others",
      "Emergency support network",
      "Skill-based matching system",
    ],
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Calendar,
    title: "Event Management",
    description: "Organize and discover community events that bring people together",
    features: [
      "Create and manage events",
      "RSVP and attendance tracking",
      "Event discovery and recommendations",
      "Recurring event scheduling",
    ],
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Users,
    title: "Community Forum",
    description: "Engage in meaningful discussions with your neighbors",
    features: [
      "Topic-based discussions",
      "Local news and updates",
      "Q&A with community experts",
      "Moderated safe spaces",
    ],
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: MessageCircle,
    title: "Direct Messaging",
    description: "Private, secure communication between community members",
    features: ["One-on-one conversations", "Group messaging", "File and photo sharing", "Message encryption"],
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: MapPin,
    title: "Local Directory",
    description: "Discover local businesses and services recommended by neighbors",
    features: [
      "Business listings and reviews",
      "Service provider recommendations",
      "Local resource mapping",
      "Community-verified information",
    ],
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Stay informed about what matters most in your community",
    features: ["Customizable alert preferences", "Emergency notifications", "Event reminders", "Help request alerts"],
    color: "from-blue-500 to-indigo-600",
  },
]

const benefits = [
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Your privacy and safety are our top priorities with end-to-end encryption and verified members.",
  },
  {
    icon: Zap,
    title: "Fast & Reliable",
    description: "Get help quickly with our instant notification system and responsive community network.",
  },
  {
    icon: Clock,
    title: "24/7 Available",
    description: "Community support is always available, whether it's an emergency or everyday assistance.",
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
      <Header />

      <main className="py-20">
        <div className="container">
          {/* Hero Section */}
          <div className="mx-auto max-w-4xl text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">Our Services</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-6">
              Everything you need to build a{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                thriving community
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Our comprehensive platform provides all the tools and features you need to connect with neighbors,
              organize events, get help when you need it, and build lasting relationships in your community.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-20">
            {services.map((service, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 group"
              >
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${service.color} text-white group-hover:scale-110 transition-transform`}
                    >
                      <service.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {service.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-muted-foreground">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Community Connect?</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">Built with your community's needs in mind</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-lg text-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
                >
                  <CardContent className="pt-8">
                    <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-fit mx-auto mb-4">
                      <benefit.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
              <p className="text-xl mb-8 text-white/90">
                Join thousands of communities already using Community Connect to build stronger neighborhoods.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register">Start Building Your Community</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                  asChild
                >
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
