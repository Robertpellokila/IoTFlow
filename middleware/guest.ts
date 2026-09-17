export default defineNuxtRouteMiddleware(async () => {
  const { user, loading, init } = useAuth()

  if (loading.value) {
    await init()
  }

  if (user.value) {
    return navigateTo('/dashboard')
  }
})
