export default defineNuxtRouteMiddleware(async (to) => {
  const { user, loading, init } = useAuth()

  if (loading.value) {
    await init()
  }

  if (!user.value && to.path !== '/login' && to.path !== '/register' && to.path !== '/forgot-password') {
    return navigateTo('/login')
  }

  if (user.value && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/dashboard')
  }
})
