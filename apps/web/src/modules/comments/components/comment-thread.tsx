import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { RiSendPlaneLine, RiUserLine } from '@remixicon/react'
import { useSession } from '../../../store/session'
import { useAuthLinks } from '../../auth/hooks/use-auth-links'
import { useComments, useCreateComment } from '../hooks/use-comments'
import {
  Avatar,
  AvatarFallback,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormAlert,
  Label,
  Skeleton,
  Textarea,
} from '../../../components/ui'

export function CommentThread({ projectId }: { projectId: string }) {
  const user = useSession((state) => state.user)
  const { signInHref } = useAuthLinks()
  const { data, isLoading } = useComments(projectId)
  const createComment = useCreateComment(projectId)
  const [body, setBody] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!body.trim() || createComment.isPending) return
    createComment.mutate(body.trim(), { onSuccess: () => setBody('') })
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
        <p className="text-sm text-muted-foreground">
          Public discussion. Share evidence, sources or concerns — comments inform the
          council but do not change the score.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Label htmlFor={`comment-${projectId}`}>Add a comment</Label>
            <Textarea
              id={`comment-${projectId}`}
              onChange={(event) => setBody(event.target.value)}
              placeholder="What should others know?"
              value={body}
              className="min-h-[80px] resize-none rounded-xl"
            />
            {createComment.isError ? (
              <FormAlert>
                <p>
                  Your comment wasn&apos;t posted. Your text is still here — try again.
                </p>
              </FormAlert>
            ) : null}
            <Button
              type="submit"
              disabled={!body.trim() || createComment.isPending}
              className="gap-2 rounded-full"
              size="sm"
            >
              <RiSendPlaneLine aria-hidden className="h-4 w-4" />
              {createComment.isPending ? 'Posting…' : 'Post comment'}
            </Button>
          </form>
        ) : (
          <div className="rounded-xl bg-muted/50 p-4 text-center text-sm text-muted-foreground">
            <Link
              to={signInHref}
              className="font-semibold text-primary-strong underline-offset-4 hover:underline"
            >
              Sign in to comment
            </Link>
          </div>
        )}

        {isLoading && (
          <div className="space-y-4 pt-4" aria-label="Loading comments">
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
          <ul className="space-y-4 border-t border-border pt-4">
            <AnimatePresence mode="popLayout">
              {data.map((comment, index) => (
                <motion.li
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-xs">
                      <RiUserLine aria-hidden className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {comment.authorId.slice(0, 8)}…
                      </span>
                      <time
                        dateTime={comment.createdAt}
                        className="text-xs text-muted-foreground"
                      >
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.body}</p>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        {data && data.length === 0 && !isLoading && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No comments yet. Share what you know about this project.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
