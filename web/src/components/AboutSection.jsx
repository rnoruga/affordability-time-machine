import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import VideoCarousel from '@/components/VideoCarousel'

export default function AboutSection({ onExplore }) {
  return (
    <div className="flex h-full overflow-hidden">
      {/* Left — narrative */}
      <div className="flex items-center justify-center pl-16 pr-12 w-3/4">
      <div className="flex flex-col gap-6 items-start w-full max-w-lg">
        {/* Headline */}
        <h1 className="text-2xl font-medium leading-8 text-foreground">
          "Just skip the lattes" they said
        </h1>

        <Separator />

        {/* Body */}
        <div className="flex flex-col gap-5 text-base font-normal text-foreground w-full">
          <p>
            In 1960, a mail carrier in Los Angeles could buy a home on 4 years of
            salary. Today, the same job requires 40. No lattes were harmed in the
            making of this crisis.
          </p>
          <p>
            This is not a financial model. It's a time machine.
            <br />
            It doesn't account for your kids, your debt, or your bad luck.
            <br />
            It only asks one question: could you afford a home here — and when
            did that stop being possible?
          </p>
        </div>

        <Button variant="default" size="default" onClick={onExplore}>
          Explore affordability
        </Button>
      </div>
      </div>

      {/* Right — video carousel */}
      <div className="w-1/4 h-full pr-[60px]">
        <VideoCarousel />
      </div>
    </div>
  )
}
