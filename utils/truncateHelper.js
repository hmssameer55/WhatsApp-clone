function truncateMessage (message, maxLength) {
  if (!message) return ''
  const formattedMessage = message
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(' ')

  if (formattedMessage.length > maxLength) {
    return formattedMessage.slice(0, maxLength) + '...'
  }

  return formattedMessage
}

export default truncateMessage
