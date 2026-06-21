function getProposalStateBadge(state: string) {
  switch (state.toLowerCase()) {
    case 'active':
      return 'success'
    case 'pending':
      return 'info'
    case 'executed':
      return 'default'
    case 'defeated':
    case 'canceled':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export { getProposalStateBadge }
