import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Calendar, MessageCircle, Users, MapPin, Bell } from "lucide-react"

const features = [
  {
    title: "Help Network",
    description:
      "Request help or offer assistance to community members. From moving help to pet sitting, we've got you covered.",
    icon: Heart,
    color: "from-blue-500 to-indigo-600",
    benefits: ["Quick Response", "Verified Members", "Safe & Secure"],
  },
  {
    title: "Event Management",
    description:
      "Create and manage community events. From block parties to charity drives, bring your neighborhood together.",
    icon: Calendar,
    color: "from-blue-500 to-indigo-600",
    benefits: ["Easy Planning", "RSVP Tracking", "Event Reminders"],
  },
  {
    title: "Community Forum",
    description:
      "Engage in meaningful discussions with your neighbors. Share news, ask questions, and build connections.",
    icon: Users,
    color: "from-blue-500 to-indigo-600",
    benefits: ["Topic Categories", "Moderated Discussions", "Expert Advice"],
  },
  {
    title: "Direct Messaging",
    description: "Connect privately with community members. Coordinate help, plan events, or just chat with neighbors.",
    icon: MessageCircle,
    color: "from-blue-500 to-indigo-600",
    benefits: ["Private & Secure", "Real-time Chat", "File Sharing"],
  },
  {
    title: "Local Directory",
    description: "Discover local businesses, services, and resources recommended by your community members.",
    icon: MapPin,
    color: "from-blue-500 to-indigo-600",
    benefits: ["Verified Reviews", "Local Focus", "Community Recommended"],
  },
  {
    title: "Smart Notifications",
    description: "Stay updated with relevant community activities, help requests, and events in your area.",
    icon: Bell,
    color: "from-blue-500 to-indigo-600",
    benefits: ["Customizable", "Real-time Updates", "Priority Alerts"],
  },
]

export function Features() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Everything you need to build a{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              stronger community
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Our platform provides all the tools you need to connect with neighbors, organize events, and create lasting
            relationships in your community.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 group"
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {feature.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground mb-4">{feature.description}</CardDescription>
                <div className="flex flex-wrap gap-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <Badge
                      key={benefitIndex}
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                    >
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
