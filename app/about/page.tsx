import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Target, Award, Globe, Shield } from "lucide-react"

const values = [
  {
    icon: Heart,
    title: "Community First",
    description: "We believe in putting community needs at the center of everything we do.",
  },
  {
    icon: Users,
    title: "Inclusive Connection",
    description: "Building bridges between people of all backgrounds and experiences.",
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    description: "Creating a safe, secure environment where everyone feels welcome.",
  },
  {
    icon: Globe,
    title: "Local Impact",
    description: "Empowering communities to create positive change at the local level.",
  },
]

const stats = [
  { number: "10,000+", label: "Community Members" },
  { number: "5,000+", label: "Help Requests Fulfilled" },
  { number: "2,500+", label: "Events Organized" },
  { number: "50+", label: "Cities Connected" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
      <Header />

      <main className="py-20">
        <div className="container">
          {/* Hero Section */}
          <div className="mx-auto max-w-4xl text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">About Us</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-6">
              Building{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Stronger Communities
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Community Connect was born from a simple belief: when neighbors help neighbors, entire communities thrive.
              We're here to make those connections easier, more meaningful, and more impactful than ever before.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 mb-20">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="text-center border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
              >
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mission */}
          <div className="mb-20">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-12 text-center">
                <Target className="h-16 w-16 mx-auto mb-6 opacity-80" />
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-xl leading-relaxed max-w-3xl mx-auto">
                  To create a world where every community is connected, supportive, and thriving. We believe that by
                  facilitating meaningful connections between neighbors, we can solve local challenges, celebrate
                  together, and build the kind of communities where everyone belongs.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">The principles that guide everything we do</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
                >
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        <value.icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {value.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground">{value.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Story */}
          <div className="mb-20">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardContent className="p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Story</h2>
                    <div className="space-y-4 text-gray-600 dark:text-gray-300">
                      <p>
                        Community Connect started in 2020 when our founders noticed how disconnected their own
                        neighborhood had become. Despite living just doors apart, neighbors barely knew each other's
                        names, let alone how to help during times of need.
                      </p>
                      <p>
                        What began as a simple neighborhood WhatsApp group quickly evolved into something much bigger.
                        We realized that communities everywhere were facing the same challenge: how to connect,
                        communicate, and collaborate effectively in the digital age.
                      </p>
                      <p>
                        Today, Community Connect serves thousands of neighborhoods worldwide, facilitating millions of
                        connections and helping communities become more resilient, supportive, and vibrant places to
                        live.
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-white">
                      <div className="h-full flex flex-col justify-center items-center text-center">
                        <Award className="h-16 w-16 mb-4 opacity-80" />
                        <h3 className="text-2xl font-bold mb-2">Award Winning</h3>
                        <p className="text-white/80">
                          Recognized for innovation in community building and social impact
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
