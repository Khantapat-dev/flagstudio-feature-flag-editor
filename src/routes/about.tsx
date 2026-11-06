import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Github,
  Code2,
  ExternalLink,
  GraduationCap,
  BriefcaseBusiness,
} from 'lucide-react'

import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

const techStack = [
  'HTML',
  'CSS',
  'JavaScript',
  'SQL Server',
  'React',
  'Vue.js',
  'Node.js',
  'TypeScript',
  'Tailwind CSS',
  'Ant Design',
  'Bootstrap',
  'Git',
  'PostgreSQL',
  'MongoDB',
]

function AboutPage() {
  return (
    <main className="mx-auto w-full space-y-8 px-4 py-8 sm:px-8">
      <Button variant="ghost" asChild>
        <Link to="/code-challenge/feature-flag-form">
          <ArrowLeft className="mr-2 size-4" />
          Back to Editor
        </Link>
      </Button>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="h-32 bg-gradient-to-r from-indigo-700 via-blue-600 to-violet-600" />

        <div className="space-y-6 px-6 pb-8 sm:px-8">
          <img
            src="/images/profile.jpg"
            alt="Khantapat"
            className="-mt-10 size-40 rounded-full border-4 border-card object-cover"
          />

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Khantapat Tungtanapanid
            </h1>

            <p className="mt-1 text-base font-medium text-indigo-500">
              Full Stack Developer
            </p>

            <p className="mt-4 leading-relaxed text-muted-foreground">
              Full-Stack Developer with hands-on experience developing business
              web applications using React and Node.js. Experienced in building
              POS, sales and invoice management, and reporting systems, with
              expertise in RESTful API development, database integration,
              document generation, and asynchronous data processing. Strong
              problem-solving skills with a focus on building practical and
              maintainable solutions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a
                href="https://github.com/Khantapat-dev"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 size-4" />
                GitHub
                <ExternalLink className="ml-2 size-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <BriefcaseBusiness className="size-5 text-indigo-500" />
            <h2 className="text-lg font-semibold">Experience</h2>
          </div>

          <p className="font-medium">Full Stack Developer</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Experience developing POS, ERP, order management, and reporting
            systems.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <GraduationCap className="size-5 text-indigo-500" />
            <h2 className="text-lg font-semibold">Education</h2>
          </div>

          <p className="font-medium">
            Bachelor of Engineering in Computer Engineering
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Srinakharinwirot University, Thailand | 2021 – 2024
          </p>
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center gap-2">
          <Code2 className="size-5 text-indigo-500" />
          <h2 className="text-lg font-semibold">Tech Stack</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-lg border border-border bg-muted px-3 py-1.5 text-sm text-foreground"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      <p className="pb-6 text-center text-xs text-muted-foreground">
        Designed & Developed by Khantapat
      </p>
    </main>
  )
}
