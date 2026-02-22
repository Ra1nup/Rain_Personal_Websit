import { EyeIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MotionPreset } from '@/components/ui/motion-preset'

import { cn } from '@/lib/utils'

export type PortfolioItem = {
  id: number
  title: string
  description: string
  link: string
  imageUrl: string
  imageAlt: string
}

const Portfolio = ({ portfolioItems }: { portfolioItems: PortfolioItem[] }) => {
  return (
    <section>
      <div className='mx-auto flex w-full max-w-6xl flex-col'>
        {/* Header */}
        <div className='space-y-2.5 px-4 py-16 md:px-6 lg:px-8'>
          <MotionPreset fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.5 }}>
            <Badge variant='outline' className='rounded-none'>
              Portfolio
            </Badge>
          </MotionPreset>

          <div className='flex justify-between gap-4 max-md:flex-col'>
            <h2 className='max-w-100 text-2xl font-semibold sm:text-3xl lg:text-4xl'>
              <MotionPreset
                fade
                blur
                slide={{ direction: 'down', offset: 50 }}
                delay={0.3}
                transition={{ duration: 0.5 }}
              >
                Portfolio highlights
              </MotionPreset>
              <MotionPreset
                fade
                blur
                slide={{ direction: 'down', offset: 50 }}
                delay={0.45}
                transition={{ duration: 0.5 }}
              >
                collection ⚡
              </MotionPreset>
            </h2>

            <MotionPreset
              delay={0.3}
              fade
              blur
              slide={{ direction: 'down', offset: 50 }}
              transition={{ duration: 0.5 }}
            >
              <p className='text-muted-foreground max-w-xl text-lg'>
                A selection of projects highlighting my creativity and problem-solving approach.From concept to
                execution, each design balances beauty and function.
              </p>
            </MotionPreset>
          </div>
        </div>

        <MotionPreset delay={0.75} fade blur transition={{ duration: 0.5 }}>
          <Separator />
        </MotionPreset>

        <div className='grid gap-x-12.5 gap-y-16 px-4 py-16 max-sm:gap-y-8 sm:grid-cols-2 md:px-6 lg:px-8'>
          {portfolioItems.map((item, index) => (
            <MotionPreset
              key={item.id}
              delay={index * 0.3 + 1.05}
              fade
              blur
              slide={{ direction: 'down', offset: 50 }}
              transition={{ duration: 0.5 }}
              className='group flex flex-col gap-6 **:transition-all **:duration-300'
            >
              <div className='lg:h-93.5'>
                <div
                  className={cn(
                    'overflow-hidden rounded-lg border shadow-sm',
                    item.id % 2 === 0 ? 'group-hover:rotate-3' : 'group-hover:-rotate-3'
                  )}
                >
                  <img src={item.imageUrl} alt={item.imageAlt} className='w-full lg:h-93.5 lg:object-center' />
                </div>
              </div>

              <div className='flex items-center justify-between gap-4 md:gap-6'>
                <div className='flex flex-col gap-2.5'>
                  <span className='text-2xl font-semibold'>{item.title}</span>
                  <span className='text-muted-foreground text-lg'>{item.description}</span>
                </div>

                <Button
                  variant='outline'
                  className='group-hover:bg-primary! group-hover:border-primary group-hover:text-primary-foreground! rounded-full !px-4'
                  asChild
                >
                  <a href={item.link} target='_blank'>
                    Preview <EyeIcon className='stroke-foreground group-hover:stroke-primary-foreground' />
                  </a>
                </Button>
              </div>
            </MotionPreset>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Portfolio
