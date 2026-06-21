import { Link } from 'react-router-dom'
import { RiAddLine } from '@remixicon/react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '../../../components/ui'

/**
 * Encourages users to request expert review or submit evidence — not public score voting.
 */
export function ReferenceProjectVotingCTA({ slug }: { slug: string }) {
  return (
    <Card className="border-primary/20 bg-card/80">
      <CardHeader>
        <CardTitle className="text-base">Contribute to the review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Official scores are published by our expert governor council. You can request a
          formal review or browse on-chain projects to submit evidence and comments.
        </p>
        <Button asChild className="w-full gap-2 rounded-full">
          <Link to="/app/analysis-request">
            <RiAddLine className="h-4 w-4" />
            Request a review
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full rounded-full">
          <Link to={`/app/reference/${slug}`}>View expert report</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
