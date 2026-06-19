import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { useSession } from '../../../store/session'
import { useComments, useCreateComment } from '../hooks/use-comments'

export function CommentThread({ projectId }: { projectId: string }) {
  const user = useSession((state) => state.user)
  const { data, isLoading } = useComments(projectId)
  const createComment = useCreateComment(projectId)
  const [body, setBody] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!body.trim()) return
    try {
      await createComment.mutateAsync(body)
      setBody('')
      toast.success('Comment posted')
    } catch {
      toast.error('Unable to post comment')
    }
  }

  return (
    <section className="rounded-lg border p-4">
      <h2 className="font-medium">Comments</h2>
      {user ? (
        <form className="mt-4 space-y-2" onSubmit={handleSubmit}>
          <textarea
            className="min-h-24 w-full rounded-md border p-3 text-sm"
            onChange={(event) => setBody(event.target.value)}
            placeholder="Add public analysis for this project"
            value={body}
          />
          <button className="rounded-md border px-3 py-2 text-sm" type="submit">
            Post comment
          </button>
        </form>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">Sign in to comment.</p>
      )}
      <div className="mt-4 space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading comments…</p>}
        {data?.map((comment) => (
          <article className="rounded-md bg-muted p-3 text-sm" key={comment.id}>
            <p>{comment.body}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleString()}
            </p>
          </article>
        ))}
        {data?.length === 0 && (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        )}
      </div>
    </section>
  )
}
