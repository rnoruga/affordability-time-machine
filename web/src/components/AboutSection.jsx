import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function AboutSection({ onExplore }) {
  return (
    <div className="flex h-full items-center justify-center pr-[120px]">
      <div className="flex flex-col gap-6 items-start max-w-[576px] w-full">
        {/* Headline */}
        <h1 className="text-2xl font-semibold leading-8 text-foreground">
          <span>"Just cut the </span>
          <span style={{ color: '#65a30d' }}>avocado</span>
          <span> toast," </span>
          <span className="font-normal">they said.</span>
          <br />
          "Skip the lattes. Save more. Try harder."
        </h1>

        <Separator />

        {/* Body */}
        <div className="flex flex-col gap-5 text-base font-medium text-muted-foreground w-full">
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

        <Button variant="secondary" size="default" onClick={onExplore}>
          Explore affordability
        </Button>
      </div>
    </div>
  )
}
