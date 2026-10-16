import { useMutation } from '@tanstack/react-query'
import { useSession } from '../../../store/session'
import { usersApi } from '../../users/api/users.api'

export function useUpdateProfile() {
  const setUser = useSession((state) => state.setUser)
  return useMutation({
    mutationFn: usersApi.updateMe,
    onSuccess: (updated) => setUser(updated),
  })
}
