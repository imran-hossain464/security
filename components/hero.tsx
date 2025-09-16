import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Heart, Users, Calendar } from "lucide-react"

export function Hero() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10"></div>
      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-blue-600 ring-1 ring-blue-600/20 hover:ring-blue-600/30 bg-blue-50 dark:bg-blue-950/50">
              Building stronger communities together{" "}
              <span className="font-semibold">
                <span className="absolute inset-0" aria-hidden="true" />
                Join us <ArrowRight className="inline h-4 w-4" />
              </span>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Connect, Help, and{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Grow Together
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Join our vibrant community platform where neighbors help neighbors, events bring people together, and every
            connection makes our community stronger. Start making a difference today.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              <Link href="/register">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>

        {/* Feature Icons */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <Heart className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Help Network</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Request help or offer assistance to community members in need
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <Calendar className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Community Events</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Organize and participate in local events that bring people together
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Connect & Chat</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Build meaningful connections through our community forum and messaging
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
