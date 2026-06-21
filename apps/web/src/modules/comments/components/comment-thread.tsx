import { useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RiCoinLine, RiInformationLine, RiSendPlaneLine, RiUserLine } from '@remixicon/react'
import { useSession } from '../../../store/session'
import { useComments, useCreateComment } from '../hooks/use-comments'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
  Avatar,
  AvatarFallback,
  Skeleton,
} from '../../../components/ui'

const COMMENT_FEE_USD = 0.05

export function CommentThread({ projectId }: { projectId: string }) {
  const user = useSession((state) => state.user)
  const { data, isLoading } = useComments(projectId)
  const createComment = useCreateComment(projectId)
  const [body, setBody] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!body.trim()) return
    await createComment.mutateAsync(body)
    setBody('')
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          Comments
          {data && data.length > 0 && (
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {data.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
          <RiInformationLine className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-muted-foreground">
            <p className="font-semibold text-foreground">Small fee per comment</p>
            <p className="mt-1">
              We charge ~${COMMENT_FEE_USD.toFixed(2)} in protocol tokens per comment to
              reduce spam and bot attacks. Each comment requires a small on-chain
              transaction — this helps keep discussions trustworthy.
            </p>
          </div>
        </div>

        {user && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              onChange={(event) => setBody(event.target.value)}
              placeholder="Share your analysis..."
              value={body}
              className="min-h-[80px] resize-none rounded-xl"
            />
            <Button
              type="submit"
              disabled={!body.trim() || createComment.isPending}
              className="gap-2 rounded-full"
              size="sm"
            >
              <RiSendPlaneLine className="h-4 w-4" />
              {createComment.isPending ? 'Posting...' : `Post comment (~$${COMMENT_FEE_USD.toFixed(2)} fee)`}
            </Button>
          </form>
        )}

        {!user && (
          <div className="rounded-xl bg-muted/50 p-4 text-center text-sm text-muted-foreground">
            Sign in to post a comment
          </div>
        )}

        {isLoading && (
          <div className="space-y-4 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {data && data.length > 0 && (
          <div className="space-y-4 border-t border-border pt-4">
            <AnimatePresence mode="popLayout">
              {data.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-xs">
                      <RiUserLine className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {comment.authorId.slice(0, 8)}...
                      </span>
                      <RiCoinLine className="h-3 w-3 text-primary" aria-hidden />
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.body}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {data && data.length === 0 && !isLoading && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No comments yet. Be the first to share your analysis!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
